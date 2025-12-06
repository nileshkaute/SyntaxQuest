import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Admin.css";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [existingQuizzes, setExistingQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Quiz state
  const [newQuiz, setNewQuiz] = useState({ title: "", questions: [] });
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // Question builder state
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    answer: ""
  });

  // Protect route
  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin"));
    if (!admin || admin.role !== "admin") {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch users
      const usersRes = await fetch("http://localhost:5000/all-users");
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      // Fetch messages
      const messagesRes = await fetch("http://localhost:5000/all-messages");
      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setMessages(messagesData);
      }

      // Fetch quizzes - FIXED VERSION
      const quizzesRes = await fetch("http://localhost:5000/all-quizzes");
      if (quizzesRes.ok) {
        const quizzesData = await quizzesRes.json();
        console.log("📥 Admin fetched quizzes:", quizzesData);
        
        // Process quizzes data safely
        const processedQuizzes = quizzesData.map(quiz => ({
          id: quiz.id,
          title: quiz.title,
          questions: Array.isArray(quiz.questions) ? quiz.questions : []
        }));
        
        setExistingQuizzes(processedQuizzes);
      }
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      setError("Failed to load some data. Check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  // Validate question before adding
  const validateQuestion = (question) => {
    if (!question.question.trim()) {
      alert("❌ Question text is required!");
      return false;
    }
    
    // Check if all options are filled
    const filledOptions = question.options.filter(opt => opt.trim());
    if (filledOptions.length !== 4) {
      alert("❌ All 4 options must be filled!");
      return false;
    }
    
    if (!question.answer.trim()) {
      alert("❌ Correct answer is required!");
      return false;
    }
    
    // Check if answer matches one of the options
    if (!question.options.includes(question.answer)) {
      alert("❌ Correct answer must match one of the options exactly!");
      return false;
    }
    
    return true;
  };

  // Add question to quiz - IMPROVED VERSION
  const addQuestionToQuiz = () => {
    console.log("➕ Adding question:", newQuestion);
    
    if (!validateQuestion(newQuestion)) {
      return;
    }

    // Clean the question data
    const cleanQuestion = {
      question: newQuestion.question.trim(),
      options: newQuestion.options.map(opt => opt.trim()),
      answer: newQuestion.answer.trim()
    };

    if (selectedQuiz) {
      // Add to existing quiz
      const updatedQuiz = {
        ...selectedQuiz,
        questions: [...selectedQuiz.questions, cleanQuestion]
      };
      setSelectedQuiz(updatedQuiz);
      console.log("✅ Question added to existing quiz");
    } else {
      // Add to new quiz
      setNewQuiz((prev) => ({
        ...prev,
        questions: [...prev.questions, cleanQuestion]
      }));
      console.log("✅ Question added to new quiz");
    }
    
    // Reset question form
    setNewQuestion({ 
      question: "", 
      options: ["", "", "", ""], 
      answer: "" 
    });
  };

  // Remove question from quiz
  const removeQuestion = (questionIndex) => {
    if (!window.confirm("Are you sure you want to remove this question?")) {
      return;
    }

    if (selectedQuiz) {
      const updatedQuiz = {
        ...selectedQuiz,
        questions: selectedQuiz.questions.filter((_, index) => index !== questionIndex)
      };
      setSelectedQuiz(updatedQuiz);
    } else {
      setNewQuiz((prev) => ({
        ...prev,
        questions: prev.questions.filter((_, index) => index !== questionIndex)
      }));
    }
  };

  // Submit new quiz to backend - IMPROVED VERSION
  const handleNewQuizSubmit = async () => {
    console.log("📤 Submitting new quiz:", newQuiz);
    
    if (!newQuiz.title.trim()) {
      alert("❌ Quiz title is required!");
      return;
    }
    
    if (newQuiz.questions.length === 0) {
      alert("❌ At least one question is required!");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:5000/create-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newQuiz.title.trim(),
          questions: newQuiz.questions
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ ${data.message}`);
        console.log("✅ Quiz created with ID:", data.quizId);
        setNewQuiz({ title: "", questions: [] });
        await fetchAllData(); // Refresh all data
      } else {
        throw new Error(data.message || "Failed to create quiz");
      }
    } catch (err) {
      console.error("❌ Error creating quiz:", err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update existing quiz - IMPROVED VERSION
  const handleUpdateQuiz = async () => {
    if (!selectedQuiz) return;
    
    console.log("🔄 Updating quiz:", selectedQuiz);
    
    if (selectedQuiz.questions.length === 0) {
      alert("❌ At least one question is required!");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:5000/update-quiz", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz_id: selectedQuiz.id,
          questions: selectedQuiz.questions
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ ${data.message}`);
        console.log("✅ Quiz updated successfully");
        setSelectedQuiz(null);
        await fetchAllData(); // Refresh all data
      } else {
        throw new Error(data.message || "Failed to update quiz");
      }
    } catch (err) {
      console.error("❌ Error updating quiz:", err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Select existing quiz to edit
  const handleSelectQuiz = (quiz) => {
    console.log("🎯 Selected quiz for editing:", quiz);
    setSelectedQuiz({ ...quiz }); // Create a copy
    setNewQuiz({ title: "", questions: [] });
  };

  // Create new quiz instead of editing existing
  const handleCreateNewQuiz = () => {
    console.log("🆕 Creating new quiz");
    setSelectedQuiz(null);
    setNewQuiz({ title: "", questions: [] });
  };

  const currentQuiz = selectedQuiz || newQuiz;
  const currentQuizTitle = selectedQuiz ? selectedQuiz.title : newQuiz.title;

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2>⚡ Admin Panel</h2>
        <div className="sidebar-nav">
          <a href="#dashboard" className="nav-active">Dashboard</a>
          <a href="#users">Users</a>
          <a href="#messages">Messages</a>
          <a href="#quizzes">Quiz Management</a>
          <a href="#settings">Settings</a>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Topbar */}
        <div className="admin-topbar">
          <h1>Admin Dashboard</h1>
          <div className="topbar-actions">
            {loading && <span className="loading-indicator">⏳ Loading...</span>}
            <button 
              onClick={fetchAllData} 
              className="refresh-btn"
              disabled={loading}
            >
              🔄 Refresh
            </button>
            <button onClick={() => {
              localStorage.removeItem("admin");
              navigate("/login");
            }}>
              Logout
            </button>
          </div>
        </div>

        <div className="admin-content">
          {/* Error Alert */}
          {error && (
            <div className="error-alert">
              ❌ {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="admin-cards">
            <div className="admin-card">
              <div className="card-icon">👥</div>
              <div className="card-content">
                <h3>Total Users</h3>
                <p className="card-number">{users.length}</p>
              </div>
            </div>
            <div className="admin-card">
              <div className="card-icon">📨</div>
              <div className="card-content">
                <h3>Messages</h3>
                <p className="card-number">{messages.length}</p>
              </div>
            </div>
            <div className="admin-card">
              <div className="card-icon">🧪</div>
              <div className="card-content">
                <h3>Total Quizzes</h3>
                <p className="card-number">{existingQuizzes.length}</p>
              </div>
            </div>
            <div className="admin-card">
              <div className="card-icon">❓</div>
              <div className="card-content">
                <h3>Total Questions</h3>
                <p className="card-number">
                  {existingQuizzes.reduce((total, quiz) => total + quiz.questions.length, 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Quiz Management Section */}
          <div className="admin-section">
            <div className="section-header">
              <h2>🧪 Quiz Management</h2>
              <div className="section-actions">
                <button 
                  onClick={handleCreateNewQuiz}
                  className="btn-primary"
                  disabled={loading}
                >
                  ➕ New Quiz
                </button>
              </div>
            </div>
            
            {/* Quiz Selection */}
            <div className="quiz-selection">
              <h3>Select Quiz to Edit:</h3>
              <select 
                onChange={(e) => {
                  const quizId = e.target.value;
                  if (quizId === "new") {
                    handleCreateNewQuiz();
                  } else {
                    const quiz = existingQuizzes.find(q => q.id == quizId);
                    if (quiz) handleSelectQuiz(quiz);
                  }
                }}
                value={selectedQuiz ? selectedQuiz.id : "new"}
                disabled={loading}
              >
                <option value="new">➕ Create New Quiz</option>
                {existingQuizzes.map(quiz => (
                  <option key={quiz.id} value={quiz.id}>
                    📝 {quiz.title} ({quiz.questions.length} questions)
                  </option>
                ))}
              </select>
            </div>

            {/* Quiz Title */}
            <div className="quiz-title-section">
              {selectedQuiz ? (
                <div className="editing-indicator">
                  <h3>✏️ Editing: {selectedQuiz.title}</h3>
                  <span className="quiz-id">Quiz ID: {selectedQuiz.id}</span>
                </div>
              ) : (
                <div className="new-quiz-title">
                  <label htmlFor="quiz-title">Quiz Title:</label>
                  <input
                    id="quiz-title"
                    type="text"
                    placeholder="Enter quiz title (e.g., 'JavaScript Basics Quiz')"
                    value={newQuiz.title}
                    onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                    disabled={loading}
                  />
                </div>
              )}
            </div>

            {/* Question Builder */}
            <div className="question-builder">
              <h3>📝 Add New Question</h3>
              
              <div className="question-form">
                <div className="form-group">
                  <label>Question:</label>
                  <textarea
                    placeholder="Enter your question here..."
                    value={newQuestion.question}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, question: e.target.value })
                    }
                    rows="3"
                    disabled={loading}
                  />
                </div>

                <div className="options-grid">
                  {newQuestion.options.map((opt, idx) => (
                    <div key={idx} className="form-group">
                      <label>Option {String.fromCharCode(65 + idx)}:</label>
                      <input
                        type="text"
                        placeholder={`Enter option ${idx + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const updatedOptions = [...newQuestion.options];
                          updatedOptions[idx] = e.target.value;
                          setNewQuestion({ ...newQuestion, options: updatedOptions });
                        }}
                        disabled={loading}
                      />
                    </div>
                  ))}
                </div>

                <div className="form-group">
                  <label>Correct Answer:</label>
                  <select
                    value={newQuestion.answer}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, answer: e.target.value })
                    }
                    disabled={loading}
                  >
                    <option value="">Select correct answer</option>
                    {newQuestion.options.map((opt, idx) => (
                      opt.trim() && (
                        <option key={idx} value={opt}>
                          {String.fromCharCode(65 + idx)}: {opt}
                        </option>
                      )
                    ))}
                  </select>
                </div>

                <button 
                  onClick={addQuestionToQuiz}
                  className="btn-primary"
                  disabled={loading}
                >
                  ➕ Add Question
                </button>
              </div>
            </div>

            {/* Preview Questions */}
            {currentQuiz.questions.length > 0 && (
              <div className="quiz-preview">
                <h4>📋 Current Questions ({currentQuiz.questions.length}):</h4>
                <div className="questions-list">
                  {currentQuiz.questions.map((q, i) => (
                    <div key={i} className="question-item">
                      <div className="question-header">
                        <strong>Q{i+1}:</strong>
                        <button 
                          onClick={() => removeQuestion(i)}
                          className="btn-danger btn-small"
                          disabled={loading}
                        >
                          🗑️ Remove
                        </button>
                      </div>
                      <div className="question-content">
                        <p className="question-text">{q.question}</p>
                        <div className="question-options">
                          {q.options.map((opt, optIdx) => (
                            <span 
                              key={optIdx} 
                              className={`option-item ${opt === q.answer ? 'correct-answer' : ''}`}
                            >
                              {String.fromCharCode(65 + optIdx)}: {opt}
                              {opt === q.answer && ' ✅'}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="quiz-actions">
              {selectedQuiz ? (
                <div className="update-actions">
                  <button 
                    onClick={handleUpdateQuiz}
                    className="btn-primary"
                    disabled={loading || selectedQuiz.questions.length === 0}
                  >
                    💾 Update Quiz
                  </button>
                  <button 
                    onClick={handleCreateNewQuiz} 
                    className="btn-secondary"
                    disabled={loading}
                  >
                    ➕ Create New Quiz Instead
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleNewQuizSubmit}
                  className="btn-primary"
                  disabled={loading || !newQuiz.title.trim() || newQuiz.questions.length === 0}
                >
                  🚀 Create Quiz
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="admin-section">
            <h2>📊 Quick Overview</h2>
            <div className="overview-grid">
              <div className="overview-item">
                <h4>👥 Recent Users</h4>
                {users.slice(-3).map((u) => (
                  <div key={u.id} className="user-item">
                    {u.name} ({u.email})
                  </div>
                ))}
                {users.length === 0 && <p>No users yet.</p>}
              </div>

              <div className="overview-item">
                <h4>📨 Recent Messages</h4>
                {messages.slice(-3).map((m) => (
                  <div key={m.id} className="message-item">
                    <strong>{m.name}</strong>: {m.message.substring(0, 50)}...
                  </div>
                ))}
                {messages.length === 0 && <p>No messages yet.</p>}
              </div>

              <div className="overview-item">
                <h4>🧪 Quiz Summary</h4>
                {existingQuizzes.slice(0, 3).map((q) => (
                  <div key={q.id} className="quiz-item">
                    <strong>{q.title}</strong>: {q.questions.length} questions
                  </div>
                ))}
                {existingQuizzes.length === 0 && <p>No quizzes yet.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;