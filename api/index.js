const express = require("express");
const app = express();

const dotenv = require("dotenv");

require("dotenv").config();

const { MongoClient } = require("mongodb");
const port = process.env.PORT;
const uri = process.env.uri;

// Middleware to parse JSON bodies
app.use(express.json());
// MongoDB connection URI

// MongoDB client

const client = new MongoClient(uri, {});

let collection;

// Connect to MongoDB and select the collection
async function connectToDatabase() {
  try {
    await client.connect();
    const database = client.db("ChessAppDataBase"); // Replace with your database name
    collection = database.collection("games"); // Replace with your collection name
    console.log("Connected to MongoDB");

    // Start the server after the connection is established
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

connectToDatabase();

//End Points

app.post("/CreateGame", async (req, res) => {
  try {
    const doc = req.body;
    const result = await collection.insertOne(doc);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to insert document" });
  }
});
