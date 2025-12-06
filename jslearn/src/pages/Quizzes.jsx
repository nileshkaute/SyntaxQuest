import React, { useState, useEffect } from "react";
import styles from "../styles/Quizzes.module.css";
import quizzesData from "../data/quizzesData.json";

const QuizApp = () => {
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [error, setError] = useState(null);

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  // Fetch quizzes from backend - COMPLETELY FIXED
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    console.log("🔄 Fetching quizzes from backend...");
    
    fetch("http://localhost:5000/all-quizzes")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Failed to fetch quizzes`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("📥 Raw backend response:", data);
        
        // Validate and clean backend data
        const backendQuizzes = data
          .filter(q => q && q.id && q.title) // Filter out invalid entries
          .map((q) => {
            // Ensure questions is always a valid array
            let questions = [];
            
            if (Array.isArray(q.questions)) {
              questions = q.questions.filter(question => 
                question && 
                question.question && 
                Array.isArray(question.options) && 
                question.options.length === 4 &&
                question.answer
              );
            }
            
            return {
              id: q.id,
              title: q.title,
              questions: questions,
              source: 'database'
            };
          });

        console.log("🔧 Processed backend quizzes:", backendQuizzes);

        // Prepare local quizzes with IDs
        const localQuizzes = quizzesData.map((quiz, index) => ({
          ...quiz,
          id: `local-${index}`,
          source: 'local'
        }));

        // Combine quizzes - prioritize database quizzes over local ones
        const allQuizzes = [...localQuizzes];
        
        backendQuizzes.forEach(backendQuiz => {
          const existingIndex = allQuizzes.findIndex(q => 
            q.title.toLowerCase().trim() === backendQuiz.title.toLowerCase().trim()
          );
          
          if (existingIndex !== -1) {
            // Replace local quiz with database quiz if database has questions
            if (backendQuiz.questions.length > 0) {
              allQuizzes[existingIndex] = backendQuiz;
              console.log(`🔄 Replaced local quiz "${backendQuiz.title}" with database version`);
            }
          } else {
            // Add new database quiz
            allQuizzes.push(backendQuiz);
            console.log(`➕ Added new database quiz: "${backendQuiz.title}"`);
          }
        });
        
        console.log("🎯 Final combined quizzes:", allQuizzes);
        setQuizzes(allQuizzes);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error loading quizzes from backend:", err);
        setError(err.message);
        
        // Fallback to local quizzes if backend fails
        console.log("🔄 Falling back to local quizzes only");
        const localQuizzes = quizzesData.map((quiz, index) => ({
          ...quiz,
          id: `local-${index}`,
          source: 'local'
        }));
        setQuizzes(localQuizzes);
        setLoading(false);
      });
  }, [lastUpdate]);

  // Manual refresh function
  const refreshQuizzes = () => {
    console.log("🔄 Manual refresh triggered");
    setLastUpdate(Date.now());
  };

  const startQuiz = (quiz) => {
    console.log("🚀 Starting quiz:", quiz.title);
    console.log("🚀 Quiz questions:", quiz.questions);
    
    if (!quiz.questions || quiz.questions.length === 0) {
      alert("This quiz has no questions yet!");
      return;
    }
    
    // Validate quiz questions before starting
    const invalidQuestion = quiz.questions.find(q => 
      !q.question || !Array.isArray(q.options) || q.options.length !== 4 || !q.answer
    );
    
    if (invalidQuestion) {
      console.error("❌ Invalid question found:", invalidQuestion);
      alert("This quiz has invalid questions. Please contact admin.");
      return;
    }
    
    setCurrentQuiz(quiz);
    setCurrentQIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption("");
  };

  const handleNext = () => {
    if (!currentQuiz || !currentQuiz.questions || !currentQuiz.questions[currentQIndex]) {
      console.error("❌ Invalid quiz state");
      alert("Quiz error occurred. Returning to quiz selection.");
      setCurrentQuiz(null);
      return;
    }

    const currentQuestion = currentQuiz.questions[currentQIndex];
    const isCorrect = selectedOption === currentQuestion.answer;
    
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    
    setSelectedOption("");

    if (currentQIndex + 1 < currentQuiz.questions.length) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      // Quiz completed
      const finalScore = isCorrect ? score + 1 : score;
      setScore(finalScore);
      setShowResult(true);

      console.log(`🎉 Quiz completed! Score: ${finalScore}/${currentQuiz.questions.length}`);

      // Save progress if user is logged in
      if (user) {
        console.log("💾 Saving quiz progress for user:", user.id);
        
        fetch(`http://localhost:5000/module-id?title=${encodeURIComponent(currentQuiz.title)}`)
          .then((res) => {
            if (!res.ok) throw new Error('Failed to get module ID');
            return res.json();
          })
          .then((data) => {
            const progressPayload = {
              user_id: user.id,
              module_id: data.module_id,
              quiz_score: finalScore,
              completed_at: new Date().toISOString().slice(0, 19).replace("T", " "),
            };

            console.log("📤 Sending progress payload:", progressPayload);

            return fetch("http://localhost:5000/quizzes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(progressPayload),
            });
          })
          .then((res) => {
            if (!res.ok) throw new Error('Failed to save progress');
            return res.json();
          })
          .then((response) => {
            console.log("✅ Progress saved:", response.message);
            
            // Auto return to quiz selection after 3 seconds
            setTimeout(() => {
              setCurrentQuiz(null);
              refreshQuizzes();
            }, 3000);
          })
          .catch((err) => {
            console.error("❌ Error saving progress:", err);
            // Still return to quiz selection even if save failed
            setTimeout(() => {
              setCurrentQuiz(null);
              refreshQuizzes();
            }, 3000);
          });
      } else {
        // No user logged in, just return to quiz selection
        setTimeout(() => {
          setCurrentQuiz(null);
          refreshQuizzes();
        }, 3000);
      }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className={styles.quizContainer}>
        <div className={styles.loading}>
          <h2>🚀 Loading Quizzes...</h2>
          <div className={styles.spinner}></div>
          {error && (
            <p className={styles.error}>
              ⚠️ Backend Error: {error}
            </p>
          )}
          <button onClick={refreshQuizzes} className={styles.refreshBtn}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  // Filter quizzes with and without questions
  const quizzesWithQuestions = quizzes.filter(quiz => 
    quiz.questions && Array.isArray(quiz.questions) && quiz.questions.length > 0
  );
  const quizzesWithoutQuestions = quizzes.filter(quiz => 
    !quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0
  );

  return (
    <div className={styles.quizContainer}>
      {/* 🌟 Stars background */}
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className={styles.star}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 3 + 3}s`,
          }}
        />
      ))}

      {/* 🧠 Quiz Selection Page */}
      {!currentQuiz ? (
        <>
          <div className={styles.quizHeader}>
            <h1 className={styles.quizTitle}>🪐 JS Quizzes Galaxy</h1>
            <button onClick={refreshQuizzes} className={styles.refreshBtn}>
              🔄 Refresh Quizzes
            </button>
          </div>
          
          <p className={styles.quizSubtitle}>
            Explore your JavaScript knowledge! Select a quiz below to start.
          </p>
          
          {/* Connection Status */}
          {error && (
            <div className={styles.connectionStatus}>
              <span className={styles.offline}>🔴 Backend Offline</span>
              <span>Using local quizzes only</span>
            </div>
          )}
          
          {!error && (
            <div className={styles.connectionStatus}>
              <span className={styles.online}>🟢 Connected to Backend</span>
            </div>
          )}
          
          {/* Quiz Statistics */}
          <div className={styles.quizStats}>
            <span>📊 Total Quizzes: {quizzes.length}</span>
            <span>✅ Available: {quizzesWithQuestions.length}</span>
            <span>⏳ Empty: {quizzesWithoutQuestions.length}</span>
            <span>❓ Total Questions: {quizzes.reduce((total, quiz) => 
              total + (quiz.questions?.length || 0), 0
            )}</span>
          </div>

          {/* Warning for empty quizzes */}
          {quizzesWithoutQuestions.length > 0 && (
            <div className={styles.warning}>
              <p>⚠️ {quizzesWithoutQuestions.length} quiz(es) have no questions yet. 
                 Check admin panel to add questions.</p>
            </div>
          )}

          <div className={styles.quizGrid}>
            {/* Available Quizzes */}
            {quizzesWithQuestions.map((quiz, i) => (
              <div key={quiz.id || i} className={styles.quizCard}>
                <h2 className={styles.quizCardTitle}>{quiz.title}</h2>
                <p className={styles.quizCardDesc}>
                  {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}
                </p>
                <div className={styles.quizMeta}>
                  {quiz.source === 'local' ? (
                    <span className={styles.quizTypeLocal}>📁 Local Quiz</span>
                  ) : (
                    <span className={styles.quizTypeDB}>☁️ Database Quiz</span>
                  )}
                </div>
                <button
                  className={styles.quizBtn}
                  onClick={() => startQuiz(quiz)}
                >
                  Start Quiz →
                </button>
              </div>
            ))}

            {/* Show empty quizzes as disabled */}
            {quizzesWithoutQuestions.map((quiz, i) => (
              <div key={quiz.id || `empty-${i}`} className={`${styles.quizCard} ${styles.disabledQuiz}`}>
                <h2 className={styles.quizCardTitle}>{quiz.title}</h2>
                <p className={styles.quizCardDesc}>No questions yet</p>
                <div className={styles.quizMeta}>
                  <span className={styles.quizTypeEmpty}>⏳ Empty Quiz</span>
                </div>
                <button
                  className={styles.quizBtn}
                  disabled
                >
                  Coming Soon
                </button>
              </div>
            ))}
          </div>
        </>
      ) : showResult ? (
        <div className={styles.resultCard}>
          <h2>🎉 Quiz Completed!</h2>
          <div className={styles.resultDetails}>
            <h3>{currentQuiz.title}</h3>
            <p className={styles.score}>
              You scored <span>{score}</span> out of <span>{currentQuiz.questions.length}</span>
            </p>
            <p className={styles.percentage}>
              Percentage: {Math.round((score / currentQuiz.questions.length) * 100)}%
            </p>
            
            {/* Performance feedback */}
            {(() => {
              const percentage = (score / currentQuiz.questions.length) * 100;
              if (percentage >= 90) return <p className={styles.excellent}>🌟 Excellent! You're a JavaScript master!</p>;
              if (percentage >= 70) return <p className={styles.good}>👍 Good job! Keep practicing!</p>;
              if (percentage >= 50) return <p className={styles.fair}>📚 Not bad, but room for improvement!</p>;
              return <p className={styles.poor}>💪 Keep studying and try again!</p>;
            })()}
          </div>
          
          <div className={styles.resultActions}>
            <button
              className={styles.quizBtn}
              onClick={() => {
                setCurrentQuiz(null);
                refreshQuizzes();
              }}
            >
              Back to Quizzes
            </button>
            <button
              className={styles.retryBtn}
              onClick={() => startQuiz(currentQuiz)}
            >
              🔄 Retry Quiz
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.questionCard}>
          <div className={styles.quizHeader}>
            <h3 className={styles.quizTitle}>{currentQuiz.title}</h3>
            <button 
              className={styles.quitBtn}
              onClick={() => setCurrentQuiz(null)}
            >
              ✕ Quit
            </button>
          </div>
          
          <div className={styles.quizProgress}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${((currentQIndex + 1) / currentQuiz.questions.length) * 100}%` }}
              ></div>
            </div>
            <span className={styles.progressText}>
              Question {currentQIndex + 1} of {currentQuiz.questions.length}
            </span>
          </div>
          
          <div className={styles.questionContent}>
            <h2 className={styles.questionText}>
              {currentQuiz.questions[currentQIndex].question}
            </h2>
            
            <div className={styles.options}>
              {currentQuiz.questions[currentQIndex].options.map((opt, idx) => (
                <button
                  key={idx}
                  className={`${styles.optionBtn} ${
                    selectedOption === opt ? styles.selected : ""
                  }`}
                  onClick={() => setSelectedOption(opt)}
                >
                  <span className={styles.optionLetter}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className={styles.optionText}>{opt}</span>
                </button>
              ))}
            </div>
            
            <div className={styles.questionActions}>
              <button
                className={styles.nextBtn}
                onClick={handleNext}
                disabled={!selectedOption}
              >
                {currentQIndex + 1 === currentQuiz.questions.length
                  ? "🏁 Finish Quiz"
                  : "Next Question →"}
              </button>
              
              {selectedOption && (
                <p className={styles.selectedIndicator}>
                  ✅ Selected: {selectedOption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizApp;