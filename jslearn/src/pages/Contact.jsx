import React, { useState } from "react";
import { FaUser, FaEnvelope, FaRegCommentDots } from "react-icons/fa";
import "../styles/Login.css"; // Reuse same styles

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Example POST (you can hook this to your backend)
    fetch("http://localhost:5000/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    })
      .then((res) => res.json())
      .then((data) => {
        setResponse(data.message || "Message sent successfully!");
        setName("");
        setEmail("");
        setMessage("");
      })
      .catch(() => setResponse("Server error, please try again later."));
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Contact Us</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FaUser />
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <FaEnvelope />
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <FaRegCommentDots />
            <textarea
              placeholder="Your Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows="4"
            ></textarea>
          </div>

          <button type="submit">Send</button>
        </form>

        {response && (
          <p style={{ marginTop: "1rem", color: "#70FFAA" }}>{response}</p>
        )}
      </div>

      {/* Floating Stars (same as Login) */}
      <div className="star star1"></div>
      <div className="star star2"></div>
      <div className="star star3"></div>
      <div className="star star4"></div>
      <div className="star star5"></div>
    </div>
  );
};

export default Contact;
