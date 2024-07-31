const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");

require("dotenv").config();

const { MongoClient, ObjectId } = require("mongodb");
const port = process.env.PORT;
const uri = process.env.uri;
app.use(cors());
app.use(express.json());

// MongoDB client

const client = new MongoClient(uri, {});

let collection;

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await client.connect();
    const database = client.db("ChessAppDataBase");
    collection = database.collection("games");
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
app.post("/createGame", async (req, res) => {
  try {
    const game = {
      creator: req.body.creator,
      currentTurn: "white",
      numberOfPlayers: 1,
      gameStatus: "pending",
      _id: generateRandomId(),
      board: defaultBoard,
      piecePostions: defaultPiecePositions,
    };

    const result = await collection.insertOne(game);
    res.status(201).json({ game: game });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to insert document" });
  }
});
app.put("/joinGame", async (req, res) => {
  const gameId = req.body.id;
  console.log("gameId", gameId);
  try {
    // Ensure the ID is a valid ObjectId
    const game = await collection.findOne({ _id: gameId });
    if (game.numberOfPlayers === 2) {
      res.status(404).send("Game is full");
    }
    game.numberOfPlayers = 2;
    game.gameStatus = "active";
    const updatedFields = {
      numberOfPlayers: 2,
      gameStatus: "active",
    };
    const result = await collection.updateOne(
      { _id: gameId },
      { $set: updatedFields }
    );

    if (game) {
      res.status(200).json(game);
    } else {
      res.status(404).send("Game not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to insert document" });
  }
});
app.get("/getGames", async (req, res) => {
  try {
    const games = await collection.find({}).toArray();
    res.status(201).json(games);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to insert document" });
  }
});

//Functions
function generateRandomId() {
  let length = 20;
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

//Defualt Variables
const defaultPiecePositions = [
  { piece: "whiteRook", x: 0, y: 0, hasMoved: false },
  { piece: "whiteKnight", x: 1, y: 0 },
  { piece: "whiteBishop", x: 2, y: 0 },
  { piece: "whiteQueen", x: 3, y: 0 },
  { piece: "whiteKing", x: 4, y: 0, hasMoved: false },
  { piece: "whiteBishop", x: 5, y: 0 },
  { piece: "whiteKnight", x: 6, y: 0 },
  { piece: "whiteRook", x: 7, y: 0, hasMoved: false },
  { piece: "whitePawn", x: 0, y: 1, hasMoved: false },
  { piece: "whitePawn", x: 1, y: 1, hasMoved: false },
  { piece: "whitePawn", x: 2, y: 1, hasMoved: false },
  { piece: "whitePawn", x: 3, y: 1, hasMoved: false },
  { piece: "whitePawn", x: 4, y: 1, hasMoved: false },
  { piece: "whitePawn", x: 5, y: 1, hasMoved: false },
  { piece: "whitePawn", x: 6, y: 1, hasMoved: false },
  { piece: "whitePawn", x: 7, y: 1, hasMoved: false },
  { piece: "blackRook", x: 0, y: 7, hasMoved: false },
  { piece: "blackKnight", x: 1, y: 7 },
  { piece: "blackBishop", x: 2, y: 7 },
  { piece: "blackQueen", x: 3, y: 7 },
  { piece: "blackKing", x: 4, y: 7, hasMoved: false },
  { piece: "blackBishop", x: 5, y: 7 },
  { piece: "blackKnight", x: 6, y: 7 },
  { piece: "blackRook", x: 7, y: 7, hasMoved: false },
  { piece: "blackPawn", x: 0, y: 6, hasMoved: false },
  { piece: "blackPawn", x: 1, y: 6, hasMoved: false },
  { piece: "blackPawn", x: 2, y: 6, hasMoved: false },
  { piece: "blackPawn", x: 3, y: 6, hasMoved: false },
  { piece: "blackPawn", x: 4, y: 6, hasMoved: false },
  { piece: "blackPawn", x: 5, y: 6, hasMoved: false },
  { piece: "blackPawn", x: 6, y: 6, hasMoved: false },
  { piece: "blackPawn", x: 7, y: 6, hasMoved: false },
];

let defaultBoard = [
  { x: 0, y: 7, color: "white" },
  { x: 1, y: 7, color: "black" },
  { x: 2, y: 7, color: "white" },
  { x: 3, y: 7, color: "black" },
  { x: 4, y: 7, color: "white" },
  { x: 5, y: 7, color: "black" },
  { x: 6, y: 7, color: "white" },
  { x: 7, y: 7, color: "black" },
  { x: 0, y: 6, color: "black" },
  { x: 1, y: 6, color: "white" },
  { x: 2, y: 6, color: "black" },
  { x: 3, y: 6, color: "white" },
  { x: 4, y: 6, color: "black" },
  { x: 5, y: 6, color: "white" },
  { x: 6, y: 6, color: "black" },
  { x: 7, y: 6, color: "white" },
  { x: 0, y: 5, color: "white" },
  { x: 1, y: 5, color: "black" },
  { x: 2, y: 5, color: "white" },
  { x: 3, y: 5, color: "black" },
  { x: 4, y: 5, color: "white" },
  { x: 5, y: 5, color: "black" },
  { x: 6, y: 5, color: "white" },
  { x: 7, y: 5, color: "black" },
  { x: 0, y: 4, color: "black" },
  { x: 1, y: 4, color: "white" },
  { x: 2, y: 4, color: "black" },
  { x: 3, y: 4, color: "white" },
  { x: 4, y: 4, color: "black" },
  { x: 5, y: 4, color: "white" },
  { x: 6, y: 4, color: "black" },
  { x: 7, y: 4, color: "white" },
  { x: 0, y: 3, color: "white" },
  { x: 1, y: 3, color: "black" },
  { x: 2, y: 3, color: "white" },
  { x: 3, y: 3, color: "black" },
  { x: 4, y: 3, color: "white" },
  { x: 5, y: 3, color: "black" },
  { x: 6, y: 3, color: "white" },
  { x: 7, y: 3, color: "black" },
  { x: 0, y: 2, color: "black" },
  { x: 1, y: 2, color: "white" },
  { x: 2, y: 2, color: "black" },
  { x: 3, y: 2, color: "white" },
  { x: 4, y: 2, color: "black" },
  { x: 5, y: 2, color: "white" },
  { x: 6, y: 2, color: "black" },
  { x: 7, y: 2, color: "white" },
  { x: 0, y: 1, color: "white" },
  { x: 1, y: 1, color: "black" },
  { x: 2, y: 1, color: "white" },
  { x: 3, y: 1, color: "black" },
  { x: 4, y: 1, color: "white" },
  { x: 5, y: 1, color: "black" },
  { x: 6, y: 1, color: "white" },
  { x: 7, y: 1, color: "black" },
  { x: 0, y: 0, color: "black" },
  { x: 1, y: 0, color: "white" },
  { x: 2, y: 0, color: "black" },
  { x: 3, y: 0, color: "white" },
  { x: 4, y: 0, color: "black" },
  { x: 5, y: 0, color: "white" },
  { x: 6, y: 0, color: "black" },
  { x: 7, y: 0, color: "white" },
];
