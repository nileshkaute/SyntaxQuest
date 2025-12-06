const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "nk@123",
  database: "jslearn",
});

db.connect((err) => {
  if (err) throw err;
  console.log("✅ MySQL Connected...");
});

// -------------------- Admin Login --------------------
app.post("/admin-login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM admin WHERE username = ?",
    [username],
    async (err, result) => {
      if (err || result.length === 0) {
        return res.status(400).json({ message: "Admin not found" });
      }

      const match = await bcrypt.compare(password, result[0].password);
      if (!match) {
        return res.status(401).json({ message: "Incorrect password" });
      }

      res.json({
        message: "Admin login successful",
        admin: {
          id: result[0].id,
          username: result[0].username,
          role: "admin",
        },
      });
    }
  );
});

// -------------------- User Login --------------------
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (result.length === 0)
        return res.status(400).json({ message: "User not found" });

      const user = result[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return res.status(400).json({ message: "Incorrect password" });

      res.json({
        message: "Login successful!",
        user: { id: user.id, name: user.name, email: user.email },
      });
    }
  );
});

// -------------------- User SignUp --------------------
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Validate password length
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    // Check if email already exists
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, result) => {
        if (err) {
          console.error("❌ Database error:", err);
          return res.status(500).json({ message: "Database error" });
        }

        if (result.length > 0) {
          return res.status(400).json({ message: "Email already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        db.query(
          "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
          [name, email, hashedPassword],
          (err, result) => {
            if (err) {
              console.error("❌ Error registering user:", err);
              return res
                .status(500)
                .json({ message: "Error registering user" });
            }
            console.log("✅ User registered with ID:", result.insertId);
            res.json({ message: "User registered successfully!" });
          }
        );
      }
    );
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- All Users --------------------
app.get("/all-users", (req, res) => {
  db.query("SELECT id, name, email FROM users", (err, result) => {
    if (err) {
      console.error("❌ Error fetching users:", err);
      return res.status(500).json({ message: "Error fetching users" });
    }
    res.json(result);
  });
});

// -------------------- Contact Form --------------------
app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  db.query(
    "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
    [name, email, message],
    (err) => {
      if (err) {
        console.error("❌ Contact form error:", err);
        return res.status(500).json({ message: "Failed to send message." });
      }
      res.json({
        message: "Thanks for reaching out! We'll get back to you soon.",
      });
    }
  );
});

// All messages
app.get("/all-messages", (req, res) => {
  db.query("SELECT id, name, message FROM contact_messages", (err, result) => {
    if (err) {
      console.error("❌ Error fetching messages:", err);
      return res.status(500).json({ message: "Error fetching messages" });
    }
    res.json(result);
  });
});

// -------------------- Create Quiz - FIXED --------------------
app.post("/create-quiz", (req, res) => {
  const { title, questions } = req.body;

  console.log("📝 Creating quiz with title:", title);
  console.log("📝 Questions received:", questions);

  if (!title || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({
      message: "Invalid quiz format - title and questions array required",
    });
  }

  // Validate each question structure
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (
      !q.question ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      !q.answer
    ) {
      return res
        .status(400)
        .json({ message: `Invalid question format at index ${i}` });
    }
  }

  const questionsJson = JSON.stringify(questions);
  console.log("💾 Storing JSON:", questionsJson);

  db.query(
    "INSERT INTO quizzes_bank (title, questions_json) VALUES (?, ?)",
    [title, questionsJson],
    (err, result) => {
      if (err) {
        console.error("❌ Error saving quiz:", err);
        return res.status(500).json({ message: "Failed to save quiz" });
      }
      console.log("✅ Quiz saved with ID:", result.insertId);
      res.json({
        message: "Quiz created successfully!",
        quizId: result.insertId,
      });
    }
  );
});

// -------------------- Update Existing Quiz - FIXED --------------------
app.put("/update-quiz", (req, res) => {
  const { quiz_id, questions } = req.body;

  console.log("🔄 Updating quiz ID:", quiz_id);
  console.log("🔄 New questions:", questions);

  if (!quiz_id || !Array.isArray(questions)) {
    return res.status(400).json({
      message: "Invalid quiz data - quiz_id and questions array required",
    });
  }

  // Validate each question structure
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (
      !q.question ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      !q.answer
    ) {
      return res
        .status(400)
        .json({ message: `Invalid question format at index ${i}` });
    }
  }

  // First, check if quiz exists
  db.query(
    "SELECT * FROM quizzes_bank WHERE id = ?",
    [quiz_id],
    (err, result) => {
      if (err) {
        console.error("❌ Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      const questionsJson = JSON.stringify(questions);
      console.log("💾 Updating with JSON:", questionsJson);

      // Update the quiz
      db.query(
        "UPDATE quizzes_bank SET questions_json = ? WHERE id = ?",
        [questionsJson, quiz_id],
        (err) => {
          if (err) {
            console.error("❌ Error updating quiz:", err);
            return res.status(500).json({ message: "Failed to update quiz" });
          }
          console.log("✅ Quiz updated successfully");
          res.json({ message: "Quiz updated successfully!" });
        }
      );
    }
  );
});

// -------------------- Get All Quizzes - COMPLETELY FIXED --------------------
app.get("/all-quizzes", (req, res) => {
  db.query("SELECT * FROM quizzes_bank", (err, result) => {
    if (err) {
      console.error("❌ Error fetching quizzes:", err);
      return res.status(500).json({ message: "Error fetching quizzes" });
    }

    console.log("📥 Raw database results:", result);

    // Parse quizzes safely and consistently
    const parsedQuizzes = result.map((quiz) => {
      try {
        let questions = [];

        if (quiz.questions_json) {
          // Handle both string and already parsed JSON
          if (typeof quiz.questions_json === "string") {
            if (quiz.questions_json.trim() !== "") {
              questions = JSON.parse(quiz.questions_json);
            }
          } else if (typeof quiz.questions_json === "object") {
            questions = quiz.questions_json;
          }
        }

        // Ensure questions is always an array
        if (!Array.isArray(questions)) {
          console.warn(
            `⚠️ Questions for quiz ${quiz.id} is not an array:`,
            questions
          );
          questions = [];
        }

        const parsedQuiz = {
          id: quiz.id,
          title: quiz.title,
          questions: questions,
        };

        console.log(`✅ Parsed quiz ${quiz.id}:`, parsedQuiz);
        return parsedQuiz;
      } catch (e) {
        console.error(`❌ Error parsing quiz ${quiz.id}:`, e);
        console.error(`❌ Raw questions_json:`, quiz.questions_json);
        return {
          id: quiz.id,
          title: quiz.title,
          questions: [],
        };
      }
    });

    console.log("📤 Sending parsed quizzes:", parsedQuizzes);
    res.json(parsedQuizzes);
  });
});

// -------------------- Delete Question from Quiz --------------------
app.put("/delete-question", (req, res) => {
  const { quiz_id, question_index } = req.body;

  if (!quiz_id || question_index === undefined) {
    return res
      .status(400)
      .json({ message: "Quiz ID and question index are required" });
  }

  db.query(
    "SELECT questions_json FROM quizzes_bank WHERE id = ?",
    [quiz_id],
    (err, result) => {
      if (err || result.length === 0) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      let questions = [];
      try {
        const rawJson = result[0].questions_json;
        if (typeof rawJson === "string") {
          questions = JSON.parse(rawJson || "[]");
        } else {
          questions = rawJson || [];
        }
      } catch (e) {
        console.error("❌ Error parsing questions:", e);
        return res.status(500).json({ message: "Error parsing questions" });
      }

      // Remove the question at the specified index
      if (question_index >= 0 && question_index < questions.length) {
        questions.splice(question_index, 1);
      }

      // Update the database
      db.query(
        "UPDATE quizzes_bank SET questions_json = ? WHERE id = ?",
        [JSON.stringify(questions), quiz_id],
        (err) => {
          if (err) {
            console.error("❌ Error updating quiz:", err);
            return res.status(500).json({ message: "Failed to update quiz" });
          }
          res.json({ message: "Question deleted successfully!", questions });
        }
      );
    }
  );
});

// -------------------- Legacy Quiz Progress --------------------
app.post("/quiz-progress", (req, res) => {
  const { user_id, module_id, module_name, quiz_score } = req.body;

  db.query("SELECT id FROM users WHERE id = ?", [user_id], (err, result) => {
    if (err || result.length === 0) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    db.query(
      "INSERT INTO quiz_progress_old (user_id, module_id, module_name, quiz_score) VALUES (?, ?, ?, ?)",
      [user_id, module_id, module_name, quiz_score],
      (err) => {
        if (err) {
          console.error("❌ SQL Insert Error:", err);
          return res.status(500).json({ message: "Error saving progress" });
        }
        res.json({ message: "Quiz progress saved!" });
      }
    );
  });
});

// -------------------- Normalized Quiz Save --------------------
app.post("/quizzes", (req, res) => {
  const { user_id, module_id, quiz_score, completed_at } = req.body;

  if (!user_id || !module_id || quiz_score == null || !completed_at) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Ensure quiz_score is a number
  const numericScore = parseInt(quiz_score);
  if (isNaN(numericScore)) {
    return res.status(400).json({ message: "Quiz score must be a number" });
  }

  db.query("SELECT id FROM users WHERE id = ?", [user_id], (err, result) => {
    if (err || result.length === 0) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    db.query(
      "INSERT INTO quizzes (user_id, module_id, quiz_score, completed_at) VALUES (?, ?, ?, ?)",
      [user_id, module_id, numericScore, completed_at],
      (err) => {
        if (err) {
          console.error("❌ SQL Insert Error:", err);
          return res.status(500).json({ message: "Error saving quiz" });
        }
        res.json({ message: "Quiz saved successfully!" });
      }
    );
  });
});

// -------------------- Fixed: Fetch Quiz Progress --------------------
app.get("/user-quiz-progress/:user_id", (req, res) => {
  const user_id = req.params.user_id;

  const sql = `
    SELECT 
      COUNT(*) AS quizzesSolved,
      COALESCE(SUM(quiz_score), 0) AS totalScore,
      COUNT(DISTINCT module_id) AS modulesCompleted
    FROM quizzes
    WHERE user_id = ?
  `;

  db.query(sql, [user_id], (err, result) => {
    if (err) {
      console.error("❌ Error fetching quiz progress:", err);
      return res.status(500).json({ message: "Error fetching quiz progress" });
    }

    // Use fixed total modules count (7) to match frontend expectation
    const totalModules = 7; // Fixed value matching your frontend
    const modulesCompleted = parseInt(result[0]?.modulesCompleted) || 0;
    const totalScore = parseInt(result[0]?.totalScore) || 0;
    const quizzesSolved = parseInt(result[0]?.quizzesSolved) || 0;

    // Calculate percentage based on 7 total modules
    const progressPercent = Math.round((modulesCompleted / totalModules) * 100);

    res.json({
      progress: totalScore,
      modulesCompleted: modulesCompleted,
      quizzesSolved: quizzesSolved,
      streak: 3,
      percent: Math.min(progressPercent, 100), // Ensure it doesn't exceed 100%
    });
  });
});

// Add this to your server.js - FIXED module-id endpoint

// Replace your module-id endpoint in server.js with this:

app.get("/module-id", (req, res) => {
  const { title } = req.query;
  if (!title)
    return res.status(400).json({ message: "Module title is required" });

  console.log(`Looking up module for quiz title: "${title}"`);

  // Updated mapping to match your actual database quiz titles
  const titleMapping = {
    // Your actual database quiz titles
    "Loops & Iteration": "Loops",
    Functions: "Functions",
    "Variables & Data Types": "Variables",
    "Operators & Conditionals": "Operators",
    Loops: "Loops",
    "Arrays & Objects": "Arrays",
    "DOM & Events": "DOM & Events",

    // Legacy mappings (in case you still have old titles)
    "Loop Master": "Loops",
    "Function Fundamentals": "Functions",
    "DOM & Events Challenge": "DOM & Events",
    "Array Adventures": "Arrays",
    "Object Odyssey": "Objects",
    "Advanced Concepts": "Advanced",
    "ES6 Features": "ES6",
  };

  const moduleName = titleMapping[title] || title;
  console.log(`Mapped "${title}" to module: "${moduleName}"`);

  // Direct module ID mapping based on your database titles
  const directModuleMapping = {
    "Loops & Iteration": 1,
    "Variables & Data Types": 2,
    "Operators & Conditionals": 3,
    Functions: 4,
    "Arrays & Objects": 5,
    "DOM & Events": 6,
    Loops: 1, // Same as "Loops & Iteration"

    // Legacy support
    "Loop Master": 1,
    "Function Fundamentals": 4,
    "Array Adventures": 5,
    "Object Odyssey": 5,
    "DOM & Events Challenge": 6,
    "Advanced Concepts": 7,
    "ES6 Features": 7,
  };

  // First try direct mapping
  const directModuleId = directModuleMapping[title];
  if (directModuleId) {
    console.log(
      `Found direct mapping: module_id ${directModuleId} for "${title}"`
    );
    return res.json({ module_id: directModuleId });
  }

  // Fallback: try database lookup
  db.query(
    "SELECT module_id FROM modules WHERE module_name = ?",
    [moduleName],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.length > 0) {
        console.log(
          `Found in database: module_id ${result[0].module_id} for "${moduleName}"`
        );
        return res.json({ module_id: result[0].module_id });
      }

      console.log(`No mapping found for: "${title}"`);

      // Final fallback - assign based on keywords
      if (title.toLowerCase().includes("loop"))
        return res.json({ module_id: 1 });
      if (
        title.toLowerCase().includes("variable") ||
        title.toLowerCase().includes("data")
      )
        return res.json({ module_id: 2 });
      if (
        title.toLowerCase().includes("operator") ||
        title.toLowerCase().includes("conditional")
      )
        return res.json({ module_id: 3 });
      if (title.toLowerCase().includes("function"))
        return res.json({ module_id: 4 });
      if (
        title.toLowerCase().includes("array") ||
        title.toLowerCase().includes("object")
      )
        return res.json({ module_id: 5 });
      if (
        title.toLowerCase().includes("dom") ||
        title.toLowerCase().includes("event")
      )
        return res.json({ module_id: 6 });

      // Default fallback
      return res.json({ module_id: 1 });
    }
  );
});
// -------------------- Enhanced Quiz Progress Tracking --------------------
app.get("/user-quiz-progress/:user_id", (req, res) => {
  const user_id = req.params.user_id;

  console.log(`📊 Fetching progress for user ${user_id}`);

  // Enhanced query to get detailed progress
  const sql = `
    SELECT 
      COUNT(*) AS quizzesSolved,
      COALESCE(SUM(quiz_score), 0) AS totalScore,
      COUNT(DISTINCT module_id) AS modulesCompleted,
      GROUP_CONCAT(DISTINCT module_id ORDER BY module_id) AS completedModules
    FROM quizzes
    WHERE user_id = ?
  `;

  db.query(sql, [user_id], (err, result) => {
    if (err) {
      console.error("❌ Error fetching quiz progress:", err);
      return res.status(500).json({ message: "Error fetching quiz progress" });
    }

    const data = result[0] || {};
    const totalModules = 7;
    const modulesCompleted = parseInt(data.modulesCompleted) || 0;
    const totalScore = parseInt(data.totalScore) || 0;
    const quizzesSolved = parseInt(data.quizzesSolved) || 0;
    const completedModules = data.completedModules
      ? data.completedModules.split(",")
      : [];

    // Calculate percentage based on completed modules
    const progressPercent = Math.round((modulesCompleted / totalModules) * 100);

    const progressData = {
      progress: totalScore,
      modulesCompleted: modulesCompleted,
      quizzesSolved: quizzesSolved,
      streak: 3, // You can implement actual streak logic later
      percent: Math.min(progressPercent, 100),
      completedModuleIds: completedModules,
    };

    console.log("📈 Sending progress data:", progressData);
    res.json(progressData);
  });
});

// -------------------- Debug endpoint to check quiz data --------------------
app.get("/debug/user-quizzes/:user_id", (req, res) => {
  const user_id = req.params.user_id;

  db.query(
    "SELECT * FROM quizzes WHERE user_id = ? ORDER BY completed_at DESC",
    [user_id],
    (err, result) => {
      if (err) {
        console.error("❌ Debug query error:", err);
        return res.status(500).json({ message: "Debug query failed" });
      }

      console.log(
        `🔍 Debug: Found ${result.length} quiz records for user ${user_id}`
      );
      res.json({
        count: result.length,
        quizzes: result,
        distinctModules: [...new Set(result.map((q) => q.module_id))],
        moduleCount: [...new Set(result.map((q) => q.module_id))].length,
      });
    }
  );
});

// -------------------- Verify User --------------------
app.get("/verify-user/:id", (req, res) => {
  const userId = req.params.id;

  db.query(
    "SELECT id, name, email FROM users WHERE id = ?",
    [userId],
    (err, result) => {
      if (err) return res.status(500).json({ valid: false });
      if (result.length === 0) return res.json({ valid: false });

      res.json({ valid: true, user: result[0] });
    }
  );
});

// -------------------- Fallback Error Handler --------------------
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// -------------------- Start Server --------------------
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
