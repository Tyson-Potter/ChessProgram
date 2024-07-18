const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const app = express();
const port = 3000;

// Open SQLite database
const dbPath = path.resolve(__dirname, "../database/mydatabase.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

app.use(express.json());

// app.post("/users", (req, res) => {
//   const { name, email } = req.body;
//   db.run(
//     "INSERT INTO users (name, email) VALUES (?, ?)",
//     [name, email],
//     function (err) {
//       if (err) {
//         res.status(500).json({ error: err.message });
//         return;
//       }
//       res.status(201).json({ user_id: this.lastID });
//     }
//   );
// });

process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err.message);
    } else {
      console.log("Closed the database connection.");
    }
    process.exit(0);
  });
});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
