// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaHome, 
  FaBook, 
  FaQuestionCircle, 
  FaChalkboardTeacher, 
  FaEnvelope, 
  FaUser,
  FaSignOutAlt
} from "react-icons/fa";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for logged in user
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Error parsing user:", err);
      }
    }

    // Listen for storage changes (for logout from other tabs)
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("user");
      if (updatedUser) {
        setUser(JSON.parse(updatedUser));
      } else {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };
  
  return (
    <nav className="bg-[#0f0f0f] text-white px-6 py-4 flex justify-between items-center shadow-lg">
      
      <Link to="/" className="text-2xl font-bold tracking-wide text-[#00f2ff] hover:text-[#7f00ff] transition">
        Syntax Quest
      </Link>
      
      <ul className="flex items-center space-x-6 text-sm font-medium">
        <li className="flex items-center space-x-1 hover:text-[#00f2ff] transition">
          <FaHome /> <Link to="/">Home</Link>
        </li>
        <li className="flex items-center space-x-1 hover:text-[#7f00ff] transition">
          <FaBook /> <Link to="/modules">Modules</Link>
        </li>
        <li className="flex items-center space-x-1 hover:text-[#ff00cc] transition">
          <FaQuestionCircle /> <Link to="/quizzes">Quizzes</Link>
        </li>
        <li className="flex items-center space-x-1 hover:text-[#ff00cc] transition">
          <FaChalkboardTeacher /> <Link to="/learn/loops">Learn</Link>
        </li>
        <li className="flex items-center space-x-1 hover:text-[#00ff99] transition">
          <FaEnvelope /> <Link to="/contact">Contact</Link>
        </li>
        
        {/* User Authentication Section */}
        {user ? (
          <>
            <li className="flex items-center space-x-1 text-[#00f2ff]">
              <FaUser /> <span>{user.name}</span>
            </li>
            <li>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-1 hover:text-[#ff4444] transition cursor-pointer bg-transparent border-none text-white text-sm font-medium"
              >
                <FaSignOutAlt /> <span>Logout</span>
              </button>
            </li>
          </>
        ) : (
          <>
            <li className="flex items-center space-x-1 hover:text-[#ffd700] transition">
              <FaUser /><Link to="/login">Login</Link>
            </li>
            <li className="hover:text-[#00ff99] transition">
              <Link to="/signup">Sign Up</Link>
            </li>
          </>
        )}
      </ul>
      
    </nav>
  );
};

export default Navbar;
