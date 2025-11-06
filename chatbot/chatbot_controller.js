// chatbot/chatbot_controller.js
const { PythonShell } = require("python-shell");
const path = require("path");

exports.chatWithBot = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });

  const options = {
    mode: "json",
    pythonPath: path.join(__dirname, "../venv/bin/python"), // 👈 use venv’s python
    pythonOptions: ["-u"],
    scriptPath: path.join(__dirname),
  };

  const pyshell = new PythonShell("run_chatbot.py", options);

  let output = null;

  pyshell.send({ message });

  pyshell.on("message", (result) => {
    output = result;
  });

  pyshell.end((err) => {
    if (err) {
      console.error("🐍 Python error:", err);
      return res.status(500).json({ error: "Chatbot internal error" });
    }

    if (!output || !output.response) {
      return res.json({ response: "I didn’t understand that. Try again?" });
    }

    res.json(output);
  });
};
