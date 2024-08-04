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
    //TODO
    //clear colletion DELTE ME LATER
    // await collection.deleteMany({});
    //TODO
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
      piecePositions: defaultPiecePositions,
      winner: null,
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

//TODO
app.put("/move", async (req, res) => {
  try {
    let gameId = req.body.gameId;
    let pieaceToMove = req.body.pieaceToMove;
    let playerColor = req.body.playerColor;
    let squareToMoveTo = req.body.squareToMoveTo;

    const game = await collection.findOne({ _id: gameId });

    if (game.currentTurn != playerColor || game.gameStatus != "active") {
      res.status(500).json({ error: "Not Your Turn" });
    }

    let newGameState = movePiece(
      pieaceToMove,
      squareToMoveTo,
      playerColor,
      game
    );

    if (newGameState != null) {
      //TODO
      //Check if Game is Over
      const result = await collection.updateOne(
        { _id: gameId },
        {
          $set: {
            piecePositions: newGameState.piecePositions,
            currentTurn: newGameState.currentTurn,
          },
        }
      );
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to move Piece" });
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

function movePiece(pieceToMove, squareToMoveTo, playerColor, game) {
  console.log("Moving Piece");
  let gameState;
  switch (pieceToMove.type) {
    case "rook":
      gameState = moveRook(pieceToMove, squareToMoveTo, playerColor, game);
      if (gameState != null) {
        return gameState;
      } else {
        return null;
      }
    case "knight":
      gameState = moveKnight(pieceToMove, squareToMoveTo, playerColor, game);
      if (gameState != null) {
        return gameState;
      } else {
        return null;
      }
    case "bishop":
      gameState = moveBishop(pieceToMove, squareToMoveTo, playerColor, game);
      if (gameState != null) {
        return gameState;
      } else {
        return null;
      }
    case "queen":
      gameState = moveQueen(pieceToMove, squareToMoveTo, playerColor, game);
      if (gameState != null) {
        return gameState;
      } else {
        return null;
      }
    case "king":
      gameState = moveKing(pieceToMove, squareToMoveTo, playerColor, game);
      if (gameState != null) {
        return gameState;
      } else {
        return null;
      }
    case "pawn":
      gameState = movePawn(pieceToMove, squareToMoveTo, playerColor, game);
      if (gameState != null) {
        return gameState;
      } else {
        return null;
      }
    default:
      console.log("Unknown piece type");
      return null;
  }
}

//TODO
function checkForCheckMate() {}
//TODO
function moveRook(pieceToMove, squareToMoveTo, playerColor, game) {
  console.log("Moving Rook");
  //Check if the piece is moving in a straight line
  if (pieceToMove.x != squareToMoveTo.x && pieceToMove.y != squareToMoveTo.y) {
    return null;
  } else if (pieceToMove.x != squareToMoveTo.x) {
    //moving on the x axis to the left
    if (pieceToMove.x > squareToMoveTo.x) {
      let pointsArray = [];
      for (let i = squareToMoveTo.x + 1; i < pieceToMove.x; i++) {
        pointsArray.push({ x: i, y: pieceToMove.y });
      }

      for (let i = 0; i < game.piecePositions.length; i++) {
        for (let point of pointsArray) {
          if (
            game.piecePositions[i].x == point.x &&
            game.piecePositions[i].y == point.y
          ) {
            console.log(
              point.x +
                " " +
                point.y +
                "// " +
                game.piecePositions[i].x +
                " " +
                game.piecePositions[i].y
            );
            console.log("Piece in the way");
            return null; // Exit if a piece is found in the way
          }
        }
      }
      //todo all logic to check if king will be in check if we move after this
      console.log("No piece in the way");
      return null;
    } else if (pieceToMove.x < squareToMoveTo.x) {
      let pointsArray = [];
      for (let i = pieceToMove.x + 1; i < squareToMoveTo.x; i++) {
        pointsArray.push({ x: i, y: pieceToMove.y });
      }

      for (let i = 0; i < game.piecePositions.length; i++) {
        for (let point of pointsArray) {
          if (
            game.piecePositions[i].x == point.x &&
            game.piecePositions[i].y == point.y
          ) {
            console.log(
              point.x +
                " " +
                point.y +
                "// " +
                game.piecePositions[i].x +
                " " +
                game.piecePositions[i].y
            );
            console.log("Piece in the way");
            return null; // Exit if a piece is found in the way
          }
        }
      }
      //todo all logic to check if king will be in check if we move after this
      console.log("No piece in the way");
      return null;
    }
  } else if (pieceToMove.y != squareToMoveTo.y) {
    //
    if (pieceToMove.y > squareToMoveTo.y) {
      let pointsArray = [];
      for (let i = squareToMoveTo.y + 1; i < pieceToMove.y; i++) {
        pointsArray.push({ x: pieceToMove.x, y: i });
      }

      for (let i = 0; i < game.piecePositions.length; i++) {
        for (let point of pointsArray) {
          if (
            game.piecePositions[i].x == point.x &&
            game.piecePositions[i].y == point.y
          ) {
            console.log(
              point.x +
                " " +
                point.y +
                "// " +
                game.piecePositions[i].x +
                " " +
                game.piecePositions[i].y
            );
            console.log("Piece in the way");
            return null; // Exit if a piece is found in the way
          }
        }
      }
      //todo all logic to check if king will be in check if we move after this
      console.log("No piece in the way");
      return null;
    } else if (pieceToMove.y < squareToMoveTo.y) {
      let pointsArray = [];
      for (let i = pieceToMove.y + 1; i < squareToMoveTo.y; i++) {
        pointsArray.push({ x: pieceToMove.x, y: i });
      }

      for (let i = 0; i < game.piecePositions.length; i++) {
        for (let point of pointsArray) {
          if (
            game.piecePositions[i].x == point.x &&
            game.piecePositions[i].y == point.y
          ) {
            console.log(
              point.x +
                " " +
                point.y +
                "// " +
                game.piecePositions[i].x +
                " " +
                game.piecePositions[i].y
            );
            console.log("Piece in the way");
            return null; // Exit if a piece is found in the way
          }
        }
      }
      //todo all logic to check if king will be in check if we move after this
      console.log("No piece in the way");
      return null;
    }
    /////////////////////////////////
    //moving on the y axis
  } else {
    //piece is not moving
    return null;
  }
}
//TODO
function moveKnight(pieceToMove, squareToMoveTo, playerColor, game) {}
//TODO
function moveBishop(pieceToMove, squareToMoveTo, playerColor, game) {}
//TODO
function moveQueen(pieceToMove, squareToMoveTo, playerColor, game) {}
//TODO
function moveKing(pieceToMove, squareToMoveTo, playerColor, game) {}
//TODO
function movePawn(pieceToMove, squareToMoveTo, playerColor, game) {}
//Defualt Variables
const defaultPiecePositions = [
  {
    piece: "whiteRook",
    type: "rook",
    x: 0,
    y: 0,
    hasMoved: false,
    color: "white",
  },
  { piece: "whiteKnight", type: "knight", x: 1, y: 0, color: "white" },
  { piece: "whiteBishop", type: "bishop", x: 2, y: 0, color: "white" },
  { piece: "whiteQueen", type: "queen", x: 3, y: 0, color: "white" },
  {
    piece: "whiteKing",
    type: "king",
    x: 4,
    y: 0,
    hasMoved: false,
    color: "white",
  },
  { piece: "whiteBishop", type: "bishop", x: 5, y: 0, color: "white" },
  { piece: "whiteKnight", type: "knight", x: 6, y: 0, color: "white" },
  {
    piece: "whiteRook",
    type: "rook",
    x: 7,
    y: 0,
    hasMoved: false,
    color: "white",
  },
  {
    piece: "whitePawn",
    type: "pawn",
    x: 0,
    y: 1,
    hasMoved: false,
    color: "white",
  },
  {
    piece: "whitePawn",
    type: "pawn",
    x: 1,
    y: 1,
    hasMoved: false,
    color: "white",
  },
  {
    piece: "whitePawn",
    type: "pawn",
    x: 2,
    y: 1,
    hasMoved: false,
    color: "white",
  },
  {
    piece: "whitePawn",
    type: "pawn",
    x: 3,
    y: 1,
    hasMoved: false,
    color: "white",
  },
  {
    piece: "whitePawn",
    type: "pawn",
    x: 4,
    y: 1,
    hasMoved: false,
    color: "white",
  },
  {
    piece: "whitePawn",
    type: "pawn",
    x: 5,
    y: 1,
    hasMoved: false,
    color: "white",
  },
  {
    piece: "whitePawn",
    type: "pawn",
    x: 6,
    y: 1,
    hasMoved: false,
    color: "white",
  },
  {
    piece: "whitePawn",
    type: "pawn",
    x: 7,
    y: 1,
    hasMoved: false,
    color: "white",
  },
  {
    piece: "blackRook",
    type: "rook",
    x: 0,
    y: 7,
    hasMoved: false,
    color: "black",
  },
  { piece: "blackKnight", type: "knight", x: 1, y: 7, color: "black" },
  { piece: "blackBishop", type: "bishop", x: 2, y: 7, color: "black" },
  { piece: "blackQueen", type: "queen", x: 3, y: 7, color: "black" },
  {
    piece: "blackKing",
    type: "king",
    x: 4,
    y: 7,
    hasMoved: false,
    color: "black",
  },
  { piece: "blackBishop", type: "bishop", x: 5, y: 7, color: "black" },
  { piece: "blackKnight", type: "knight", x: 6, y: 7, color: "black" },
  {
    piece: "blackRook",
    type: "rook",
    x: 7,
    y: 7,
    hasMoved: false,
    color: "black",
  },
  {
    piece: "blackPawn",
    type: "pawn",
    x: 0,
    y: 6,
    hasMoved: false,
    color: "black",
  },
  {
    piece: "blackPawn",
    type: "pawn",
    x: 1,
    y: 6,
    hasMoved: false,
    color: "black",
  },
  {
    piece: "blackPawn",
    type: "pawn",
    x: 2,
    y: 6,
    hasMoved: false,
    color: "black",
  },
  {
    piece: "blackPawn",
    type: "pawn",
    x: 3,
    y: 6,
    hasMoved: false,
    color: "black",
  },
  {
    piece: "blackPawn",
    type: "pawn",
    x: 4,
    y: 6,
    hasMoved: false,
    color: "black",
  },
  {
    piece: "blackPawn",
    type: "pawn",
    x: 5,
    y: 6,
    hasMoved: false,
    color: "black",
  },
  {
    piece: "blackPawn",
    type: "pawn",
    x: 6,
    y: 6,
    hasMoved: false,
    color: "black",
  },
  {
    piece: "blackPawn",
    type: "pawn",
    x: 7,
    y: 6,
    hasMoved: false,
    color: "black",
  },
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
