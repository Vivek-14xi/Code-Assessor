const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(bodyParser.json());

// POST endpoint for running Python code
app.post("/run-python", (req, res) => {
  const userCode = req.body.code;

  // 1️⃣ Save user code to a file
  const filePath = path.join(__dirname, "test.py");
  fs.writeFileSync(filePath, userCode);

  // 2️⃣ Convert Windows path to Docker-friendly path
  let dockerFilePath = filePath.replace(/\\/g, "/");
  if (dockerFilePath[1] === ":") {
    dockerFilePath = "/" + dockerFilePath[0].toLowerCase() + dockerFilePath.slice(2);
  }

  // 3️⃣ Docker command to run Python inside container
  const dockerCmd = `docker run --rm -v "${dockerFilePath}:/app/test.py" multi-compiler-image python3 /app/test.py`;

  // 4️⃣ Execute Docker command
  exec(dockerCmd, (error, stdout, stderr) => {
    if (error) {
      console.error("Exec Error:", error);
      return res.status(500).json({ error: error.message });
    }
    if (stderr) {
      console.error("Stderr:", stderr);
      return res.status(200).json({ output: stderr });
    }
    res.status(200).json({ output: stdout });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});