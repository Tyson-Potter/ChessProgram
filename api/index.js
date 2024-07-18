const express = require("express");
const path = require("path");
const app = express();
const port = 3000;
const dotenv = require("dotenv");
// Open mySQL database
require("dotenv").config();
const mysql = require("mysql2");
//login commands
//sudo mysql.server start
//mysql -u root -p
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD, // Your MySQL root password
  database: "chessDataBase",
  port: process.env.PORT, // Ensure this matches your MySQL port
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
    return;
  }
  console.log("Connected to the database as id " + connection.threadId);

  // Query the users table
  connection.query("SELECT * FROM users", (error, results, fields) => {
    if (error) throw error;
    console.log("Users:", results);

    // Close the connection
    connection.end((err) => {
      if (err) {
        console.error("Error ending the connection:", err.stack);
        return;
      }
      console.log("Connection closed");
    });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
