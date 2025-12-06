// convert.js (ESM version)
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// So we can use __dirname with ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load your current topicsData.json
const dataPath = path.join(__dirname, "topicsData.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

// Convert all questions
for (const topicKey in data) {
  const topic = data[topicKey];
  for (const difficulty in topic.questions) {
    topic.questions[difficulty] = topic.questions[difficulty].map((q) => ({
      question: q,
      expected: guessExpected(q),
    }));
  }
}

// Very simple guesser
function guessExpected(q) {
  if (q.includes("2 + 2")) return "4";
  if (q.includes("PI")) return "❌ Error: Assignment to constant variable.";
  return "TODO"; // default
}

// Save result
const outPath = path.join(__dirname, "topicsDataAuto.json");
fs.writeFileSync(outPath, JSON.stringify(data, null, 2));

console.log("✅ Auto JSON created at", outPath);
