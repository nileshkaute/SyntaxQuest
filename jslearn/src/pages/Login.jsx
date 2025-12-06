import React, { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Try admin login first
      const adminRes = await fetch("http://localhost:5000/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      const adminData = await adminRes.json();

      if (adminRes.ok && adminData.admin) {
        localStorage.setItem("admin", JSON.stringify(adminData.admin));
        setMessage("Welcome, Admin!");
        return navigate("/admin");
      }

      // If not admin, try regular user login
      const userRes = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const userData = await userRes.json();

      if (userRes.ok && userData.user) {
        localStorage.setItem("user", JSON.stringify(userData.user));
        setMessage(`Welcome, ${userData.user.name}!`);
        return navigate("/");
      }

      setMessage(userData.message || adminData.message || "Invalid credentials");
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Server error");
    }
  };
  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <FaUser />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <FaLock />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">Login</button>
        </form>

        {message && <p style={{ marginTop: "1rem", color: "#70FFAA" }}>{message}</p>}

        <div className="extra">
          Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>

      {/* Floating Stars */}
      <div className="star star1"></div>
      <div className="star star2"></div>
      <div className="star star3"></div>
      <div className="star star4"></div>
      <div className="star star5"></div>
    </div>
  );
};

export default Login;
