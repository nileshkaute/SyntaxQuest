import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Galaxy.module.css";

const Modules = () => {
  const topics = [
    "Variables", "Data Types", "Operators", "Conditionals", "Loops",
    "Functions", "Arrays", "Objects", "Events", "DOM"
  ];

  const stars = Array.from({ length: 30 });
  const navigate = useNavigate();

  // Store planet positions
  const [positions, setPositions] = useState(
    topics.map(() => ({
      top: Math.random() * 80 + 10,
      left: Math.random() * 80 + 10,
    }))
  );

  // Move planets to new random positions every 12s
  useEffect(() => {
    const interval = setInterval(() => {
      setPositions(
        topics.map(() => ({
          top: Math.random() * 80 + 10,
          left: Math.random() * 80 + 10,
        }))
      );
    }, 12000); // slower movement

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="all">
      <section className="galaxy-preview">
        {stars.map((_, i) => (
          <div
            key={i}
            className={`star ${i % 3 === 0 ? "small" : i % 3 === 1 ? "medium" : "large"}`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${4 + Math.random() * 3}s`,
            }}
          />
        ))}

        <h2 className="galaxy-title">Explore the Syntax Galaxy</h2>
        <div className="galaxy-bubbles">
          {topics.map((topic, index) => (
            <div
              key={index}
              className="planet"
              style={{
                top: `${positions[index].top}%`,
                left: `${positions[index].left}%`,
                transition: "top 12s ease-in-out, left 15s ease-in-out",
              }}
              onClick={() =>
                navigate(`/learn/${topic.toLowerCase().replace(/\s+/g, '-')}`)
              }
            >
              {topic}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Modules;
