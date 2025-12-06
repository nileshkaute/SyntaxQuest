import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  const [completionPercent, setCompletionPercent] = useState(0);
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState({
    progress: 0,
    modulesCompleted: 0,
    quizzesSolved: 0,
    streak: 0,
  });
  const [loading, setLoading] = useState(true);
  
  // Get location to detect when returning to home page
  const location = useLocation();

  // Load user & fetch quiz progress
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      setLoading(false);
      return;
    }

    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);

    // Verify user exists in backend
    fetch(`http://localhost:5000/verify-user/${parsedUser.id}`)
      .then((res) => res.json())
      .then((verifyData) => {
        if (!verifyData.valid) {
          localStorage.removeItem("user");
          setUser(null);
          setLoading(false);
          return;
        }

        // Fetch quiz progress
        fetch(`http://localhost:5000/user-quiz-progress/${parsedUser.id}`)
          .then((res) => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
          .then((progressData) => {
            console.log("📊 Progress data received:", progressData);

            setProgress({
              progress: progressData.progress || 0,
              modulesCompleted: progressData.modulesCompleted || 0,
              quizzesSolved: progressData.quizzesSolved || 0,
              streak: progressData.streak || 0,
            });

            setCompletionPercent(progressData.percent || 0);
            setLoading(false);
          })
          .catch((err) => {
            console.error("❌ Error fetching progress:", err);
            // Set default values on error
            setProgress({
              progress: 0,
              modulesCompleted: 0,
              quizzesSolved: 0,
              streak: 0,
            });
            setCompletionPercent(0);
            setLoading(false);
          });
      })
      .catch((err) => {
        console.error("❌ Error verifying user:", err);
        setLoading(false);
      });
  }, []);

  // Refresh progress when returning to home page after completing modules
  useEffect(() => {
    if (user && location.pathname === '/' && !loading) {
      console.log("🔄 Refreshing progress on home page visit...");
      
      fetch(`http://localhost:5000/user-quiz-progress/${user.id}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((progressData) => {
          console.log("📊 Updated progress data:", progressData);

          setProgress({
            progress: progressData.progress || 0,
            modulesCompleted: progressData.modulesCompleted || 0,
            quizzesSolved: progressData.quizzesSolved || 0,
            streak: progressData.streak || 0,
          });

          setCompletionPercent(progressData.percent || 0);
        })
        .catch((err) => {
          console.error("❌ Error refreshing progress:", err);
        });
    }
  }, [location.pathname, user, loading]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <div className="all">
      {/* Hero Section */}
      <section className="home-container">
        <h1 className="home-title">Syntax Quest</h1>
        <p className="home-subtitle">
          Master JavaScript one quest at a time. Explore glowing syntax,
          floating challenges, and poetic UI.
        </p>
        {!user ? (
          <a href="/login" className="home-button">
            Start Learning
          </a>
        ) : (
          <div className="user-welcome">
            <h2>Welcome back, {user.name} 👋</h2>
            <p>Email: {user.email}</p>
            <button onClick={handleLogout} className="logout-btn">
              <span className="icon">🚪</span>
              <span className="text">Logout</span>
            </button>
          </div>
        )}
      </section>

      {/* Progress Section */}
      {user && !loading && (
        <section className="progress-section">
          <h2 className="progress-title">🚀 Your Learning Journey</h2>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completionPercent}%` }}>
              {completionPercent}%
            </div>
          </div>

          <div className="progress-stats">
            <div className="stat-card">
              <h3>📚 {progress.modulesCompleted}/7</h3>
              <p>Modules Mastered</p>
              <small>{7 - progress.modulesCompleted} more to go!</small>
            </div>
            
            <div className="stat-card">
              <h3>⭐ {progress.progress}</h3>
              <p>Total XP Earned</p>
              <small>Knowledge points</small>
            </div>
            
            <div className="stat-card">
              <h3>🔥 {progress.streak}</h3>
              <p>Day Streak</p>
              <small>Keep learning!</small>
            </div>
          </div>

          {/* Optional: Show quizzes as secondary metric */}
          <div className="secondary-metrics">
            <span>🎯 {progress.quizzesSolved} practice attempts</span>
          </div>

          <a href="/modules" className="progress-button">
            {progress.modulesCompleted === 7 ? "Review Course" : "Continue Learning"}
          </a>
        </section>
      )}

      {/* Loading State */}
      {user && loading && (
        <section className="progress-section">
          <h2 className="progress-title">🚀 Your Progress</h2>
          <p>Loading your progress...</p>
        </section>
      )}

      {/* Galaxy Section */}
      <section className="galaxy-preview">
        <h2 className="galaxy-title">Explore the Syntax Galaxy</h2>
        <div className="galaxy-grid">
          <div className="planet">Loops</div>
          <div className="planet">Arrays</div>
          <div className="planet">Functions</div>
          <div className="planet">Objects</div>
          <div className="planet">DOM</div>
          <div className="planet">Events</div>
          <div className="planet">Advanced</div>
        </div>
      </section>

      {/* Motivation Section */}
      <section className="motivation">
        <h2>Code Quotes to Inspire You</h2>
        <div className="quotes">
          <div className="quote-card card1">
            <p>"JavaScript is not just a language, it's a superpower." - Anonymous</p>
          </div>
          <div className="quote-card card2">
            <p>"First, solve the problem. Then, write the code." - John Johnson</p>
          </div>
          <div className="quote-card card3">
            <p>"Good programmers write code that humans can understand." - Martin Fowler</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <h2>Ready to start your journey?</h2>
        <a href={user ? "/modules" : "/login"} className="cta-button">
          Begin Now
        </a>
      </section>

      {/* Floating Stars */}
      <div className="star star1"></div>
      <div className="star star2"></div>
      <div className="star star3"></div>
      <div className="star star4"></div>
      <div className="star star5"></div>
    </div>
  );
};

export default Home;