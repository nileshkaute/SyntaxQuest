// src/pages/Learn.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "../styles/Lea.module.css";

import topicsData from "../data/topicsDataAuto.json";

const Learn = () => {
  const { topic } = useParams();
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [result, setResult] = useState("");

  // ✅ Expected answers for practice questions
  const expectedAnswers = {
    "Declare variables 'a=10' and 'b=20'. Print their sum.": "30",
    "Declare a variable 'username' and store your name. Print it.": (userOutput) => {
      // Check if output contains any username (not just specific one)
      const hasUsername = userOutput && userOutput.trim().length > 0 && 
                         !userOutput.includes("undefined") && 
                         !userOutput.includes("null") &&
                         userOutput !== "✅ Code executed successfully (no output)";
      return hasUsername ? "correct" : "incorrect";
    },
    "Write a for loop to print numbers 1 to 10.": "1\n2\n3\n4\n5\n6\n7\n8\n9\n10",
  };

  const runCode = () => {
    try {
      let consoleOutput = [];
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        consoleOutput.push(args.join(" "));
        originalConsoleLog.apply(console, args);
      };

      const resultVal = eval(code);
      console.log = originalConsoleLog;

      const userOutput =
        consoleOutput.length > 0
          ? consoleOutput.join("\n")
          : resultVal !== undefined
          ? String(resultVal)
          : "";

      setOutput(userOutput || "✅ Code executed successfully (no output)");

      // ✅ correctness check
      if (selectedQuestion && expectedAnswers[selectedQuestion.question]) {
        const expected = expectedAnswers[selectedQuestion.question];
        
        if (typeof expected === "function") {
          // Special handling for username question
          const checkResult = expected(userOutput);
          if (checkResult === "correct") {
            setResult("🎉 Correct! You successfully printed a username.");
          } else {
            setResult("❌ Please declare a username variable and print it.");
          }
        } else {
          // Normal string comparison for other questions
          if (userOutput.trim() === expected.trim()) {
            setResult("🎉 Correct!");
          } else {
            setResult(`❌ Wrong. Expected:\n${expected}`);
          }
        }
      } else {
        setResult("");
      }
    } catch (err) {
      setOutput("❌ Error: " + err.message);
      setResult("");
    }
  };

  const resetCode = () => {
    setCode("");
    setOutput("");
    setResult("");
  };

  useEffect(() => {
    setSelectedDifficulty("easy");
    setSelectedQuestion(null);
    resetCode();
  }, [topic]);

  if (!topic) {
    return (
      <div className={styles["learn-container"]}>
        <div className={styles["learn-sidebar"]}>
          <div className={styles["choose-topic"]}>
            <h2>Choose a Topic:</h2>
            <div className={styles["topic-buttons"]}>
              {Object.keys(topicsData).map((topicKey) => (
                <button
                  key={topicKey}
                  className={styles["topic-btn"]}
                  onClick={() => (window.location.href = `/learn/${topicKey}`)}
                >
                  <span className={styles["planet-icon"]}>🪐</span>{" "}
                  {topicsData[topicKey].title}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles["learn-editor"]}>
          <div className={styles["galaxy-preview"]}>
            <h2 className={styles["galaxy-title"]}>
              JavaScript Learning Galaxy
            </h2>
            <div className={styles["galaxy-bubbles"]}>
              {Object.keys(topicsData).map((topicKey, index) => {
                const top = [15, 40, 70, 25, 60, 10, 50, 80, 30, 65][
                  index % 10
                ];
                const left = [20, 70, 40, 60, 30, 80, 25, 65, 45, 75][
                  index % 10
                ];

                return (
                  <div
                    key={topicKey}
                    className={styles["planet"]}
                    style={{
                      top: `${top}%`,
                      left: `${left}%`,
                      animationDelay: `${index * 2}s`,
                    }}
                    onClick={() =>
                      (window.location.href = `/learn/${topicKey}`)
                    }
                  >
                    {topicsData[topicKey].title}
                  </div>
                );
              })}

              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className={styles["star"]}
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentTopic = topicsData[topic];

  return (
    <div className={styles["learn-container"]}>
      {/* Sidebar */}
      <div className={styles["learn-sidebar"]}>
        <div className={styles["sidebar-header"]}>
          <button
            className={styles["back-button"]}
            onClick={() => (window.location.href = "/learn")}
          >
            ← Back
          </button>
          <h2>{currentTopic.title}</h2>
        </div>

        {/* Topic Info */}
        <div className={styles["key-points"]}>
          <h3>Definition</h3>
          <p>{currentTopic.definition}</p>

          <h3>When to Use</h3>
          <p>{currentTopic.whenUse}</p>

          <h3>Thinking Approach</h3>
          <p>{currentTopic.thinking}</p>
        </div>

        {/* Difficulty Selector */}
        <div className={styles["key-points"]}>
          <h3>Difficulty Level</h3>
          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            {["easy", "medium", "hard"].map((difficulty) => (
              <button
                key={difficulty}
                className={styles["question-bubble"]}
                style={{
                  background:
                    selectedDifficulty === difficulty
                      ? "rgba(255, 145, 0, 0.7)"
                      : "rgba(74, 107, 163, 0.3)",
                  width: "auto",
                  padding: "0 12px",
                  borderRadius: "15px",
                }}
                onClick={() => {
                  setSelectedDifficulty(difficulty);
                  setSelectedQuestion(null);
                  resetCode();
                }}
              >
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Practice Questions */}
        <h3>Practice Questions</h3>
        <div className={styles["question-bubbles"]}>
          {currentTopic.questions[selectedDifficulty].map((q, i) => (
            <div
              key={i}
              className={`${styles["question-bubble"]} ${
                selectedQuestion === q ? styles["active"] : ""
              }`}
              onClick={() => {
                setSelectedQuestion(q);
                resetCode();
              }}
            >
              Q{i + 1}
            </div>
          ))}
        </div>

        {/* Common Confusions */}
        <div className={styles["key-points"]}>
          <h3>Common Confusions</h3>
          <ul>
            {currentTopic.confusions.map((confusion, i) => (
              <li key={i}>{confusion}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Editor */}
      <div className={styles["learn-editor"]}>
        {selectedQuestion ? (
          <>
            <div className={styles["editor-header"]}>
              <h2 className={styles["question-title"]}>
                {selectedQuestion.question}
              </h2>
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: "15px",
                  fontSize: "0.8em",
                  fontWeight: "bold",
                  marginLeft: "15px",
                  background: "#64ffda",
                  color: "#0a192f",
                }}
              >
                {selectedDifficulty.toUpperCase()}
              </div>
              <button className={styles["reset-btn"]} onClick={resetCode}>
                ⟳ Reset
              </button>
            </div>

            <div className={styles["editor-output"]}>
              {/* Editor */}
              <div className={styles["editor-pane"]}>
                <div className={styles["editor-header-bar"]}>
                  <span>JavaScript Editor</span>
                  <button className={styles["run-btn"]} onClick={runCode}>
                    ▶ Run Code
                  </button>
                </div>
                <textarea
                  className={styles["code-editor"]}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={`// Write your code here...\n// Example:\n// console.log("Hello, World!");`}
                />
              </div>

              {/* Output */}
              <div className={styles["output-pane"]}>
                <div className={styles["output-header"]}>
                  <h3>Output</h3>
                  <button
                    className={styles["clear-btn"]}
                    onClick={() => {
                      setOutput("");
                      setResult("");
                    }}
                  >
                    Clear
                  </button>
                </div>
                <div className={styles["output-box"]}>
                  <pre>{output || "⚡ Run your code to see output here"}</pre>
                  {result && (
                    <div
                      style={{
                        marginTop: "10px",
                        fontWeight: "bold",
                        color: result.startsWith("🎉") ? "lime" : "red",
                        whiteSpace: "pre-line"
                      }}
                    >
                      {result}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className={styles["galaxy-preview"]}>
            <h2 className={styles["galaxy-title"]}>
              {currentTopic.title} Practice
            </h2>
            <p>
              Select a difficulty level and question from the sidebar to start
              coding
            </p>

            {/* Topic Overview */}
            <div
              style={{
                maxWidth: "600px",
                margin: "0 auto",
                textAlign: "left",
                padding: "20px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "10px",
              }}
            >
              <h3>About {currentTopic.title}</h3>
              <p>
                <strong>Why use it:</strong> {currentTopic.whyUse}
              </p>

              <div
                style={{
                  marginTop: "15px",
                  padding: "15px",
                  background: "rgba(100, 255, 218, 0.1)",
                  borderRadius: "8px",
                }}
              >
                <h4>How to Think About It</h4>
                <p>{currentTopic.thinking}</p>
              </div>
            </div>

            {/* Stars */}
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className={styles["star"]}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Learn;