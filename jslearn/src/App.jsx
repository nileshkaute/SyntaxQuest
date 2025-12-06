import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Modules from "./pages/Modules";
import Quizzes from "./pages/Quizzes";
import Learn from "./pages/Learn";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AdminPanel from "./pages/admin/AdminPanel";

const App = () => {
  return (
    <>
      <Routes>
        {/* 🌐 Normal website layout */}
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/modules" element={<Modules />} />
                <Route path="/quizzes" element={<Quizzes />} />
                <Route path="/learn/:topic" element={<Learn />} />
                <Route path="/contact" element={<Contact />} />
               
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
              </Routes>
              <Footer />
            </>
          }
        />

        {/* 🛠 Admin page uses different layout */}
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </>
  );
};

export default App;
