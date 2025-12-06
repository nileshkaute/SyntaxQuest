import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaGithub } from "react-icons/fa";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-logo">
          <h2>Syntax Quest</h2>
          <p>Master JavaScript one quest at a time</p>
        </div>

        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/modules">Modules</Link>
          <Link to="/quizzes">Quizzes</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer-social">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
        </div>

        <p className="footer-copy">&copy; 2025 Syntax Quest. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
