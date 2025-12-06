import React, { useState } from "react";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom"; // ✅ useNavigate added
import "../styles/Login.css";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate(); // ✅ initialize navigate

  const handleSignUp = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
        if (data.message === "User registered successfully!") {
          setName("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          // ✅ Redirect to login page
          setTimeout(() => {
            navigate("/login");
          }, 1500); // wait 1.5s so user sees success message
        }
      })
      .catch((err) => {
        console.error(err);
        setMessage("Server error");
      });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Sign Up</h2>
        <form onSubmit={handleSignUp}>
          <div className="input-group">
            <FaUser />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <FaEnvelope />
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

          <div className="input-group">
            <FaLock />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">Sign Up</button>
        </form>

        {message && <p style={{ marginTop: "1rem", color: "#70FFAA" }}>{message}</p>}

        <div className="extra">
          Already have an account? <Link to="/login">Login</Link>
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

export default SignUp;
