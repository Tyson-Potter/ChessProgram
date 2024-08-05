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
    await collection.deleteMany({});
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
app.put("/getGameState", async (req, res) => {
  try {
    let gameId = req.body.gameId;
    const game = await collection.findOne({ _id: gameId });

    // Send the game state as a response
    res.status(200).json(game);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process the request" });
  }
});

app.put("/joinGame", async (req, res) => {
  const gameId = req.body.id;
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

    let newGameState = await movePiece(
      pieaceToMove,
      squareToMoveTo,
      playerColor,
      game
    );

    if (newGameState != null) {
      //trunary to chagne current turn to other
      newGameState.currentTurn =
        newGameState.currentTurn === "white" ? "black" : "white";
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

      res.status(200).json(newGameState);
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

async function movePiece(pieceToMove, squareToMoveTo, playerColor, game) {
  let gameState;
  switch (pieceToMove.type) {
    case "rook":
      gameState = await moveRook(
        pieceToMove,
        squareToMoveTo,
        playerColor,
        game
      );

      if (gameState != null) {
        return gameState;
      } else {
        return null;
      }

    case "knight":
      gameState = await moveKnight(
        pieceToMove,
        squareToMoveTo,
        playerColor,
        game
      );

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
function checkLegalGameState() {
  return true;
}
//checks if a rook can move to a square based on if there are any picess in the way
function moveRook(pieceToMove, squareToMoveTo, playerColor, game) {
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

            return null; // Exit if a piece is found in the way
          }
        }
      }

      //todo all logic to check if king will be in check if we move after this
      let returnGameState = updateGameState(game, pieceToMove, squareToMoveTo);
      if (returnGameState != null) {
        return returnGameState;
      }
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
            let returnGameState = updateGameState(
              game,
              pieceToMove,
              squareToMoveTo
            );
            if (returnGameState != null) {
              return returnGameState;
            }
          }
        }
      }
      //todo all logic to check if king will be in check if we move after this
      let returnGameState = updateGameState(game, pieceToMove, squareToMoveTo);
      if (returnGameState != null) {
        return returnGameState;
      }
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
          }
        }
      }
      //todo all logic to check if king will be in check if we move after this
      let returnGameState = updateGameState(game, pieceToMove, squareToMoveTo);
      if (returnGameState != null) {
        return returnGameState;
      }
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
            return null; // Exit if a piece is found in the way
          }
        }
      }
      //todo all logic to check if king will be in check if we move after this
      let returnGameState = updateGameState(game, pieceToMove, squareToMoveTo);
      if (returnGameState != null) {
        return returnGameState;
      }
    }
  } else {
    return null;
  }
}

//TODO
function moveBishop(pieceToMove, squareToMoveTo, playerColor, game) {
  const slope =
    (squareToMoveTo.y - pieceToMove.y) / (squareToMoveTo.x - pieceToMove.x);
  //check if the slope is a diagonal
  if (slope != 1 && slope != -1) {
    return null;
  } else {
    //moving to the right and up
    if (pieceToMove.x < squareToMoveTo.x && pieceToMove.y < squareToMoveTo.y) {
      //moving left and down
    } else if (
      pieceToMove.x > squareToMoveTo.x &&
      pieceToMove.y > squareToMoveTo.y
    ) {
      //
    } else if (
      pieceToMove.x > squareToMoveTo.x &&
      pieceToMove.y < squareToMoveTo.y
    ) {
    } else if (
      pieceToMove.x < squareToMoveTo.x &&
      pieceToMove.y > squareToMoveTo.y
    ) {
    }
  }
}

function moveKnight(pieceToMove, squareToMoveTo, playerColor, game) {
  const possibleMoves = [
    { x: pieceToMove.x + 2, y: pieceToMove.y + 1 },
    { x: pieceToMove.x + 2, y: pieceToMove.y - 1 },
    { x: pieceToMove.x - 2, y: pieceToMove.y + 1 },
    { x: pieceToMove.x - 2, y: pieceToMove.y - 1 },
    { x: pieceToMove.x + 1, y: pieceToMove.y + 2 },
    { x: pieceToMove.x + 1, y: pieceToMove.y - 2 },
    { x: pieceToMove.x - 1, y: pieceToMove.y + 2 },
    { x: pieceToMove.x - 1, y: pieceToMove.y - 2 },
  ];

  for (let i = 0; i < possibleMoves.length; i++) {
    const move = possibleMoves[i];

    if (move.x === squareToMoveTo.x && move.y === squareToMoveTo.y) {
      console.log("Square matches a possible knight move!");
      let returnGameState = updateGameState(game, pieceToMove, squareToMoveTo);
      if (returnGameState != null) {
        return returnGameState;
      }
    }
  }

  //no valid move
  return null;
}

//TODO
function moveQueen(pieceToMove, squareToMoveTo, playerColor, game) {}
//TODO
function moveKing(pieceToMove, squareToMoveTo, playerColor, game) {}
//TODO
function movePawn(pieceToMove, squareToMoveTo, playerColor, game) {}

function updateGameState(game, pieceToMove, squareToMoveTo) {
  let legalGameState = checkLegalGameState();

  if (legalGameState) {
    // Remove any piece that is on the target square or the current piece's position
    game.piecePositions = game.piecePositions.filter((position) => {
      return !(
        (position.x === squareToMoveTo.x && position.y === squareToMoveTo.y) ||
        (position.x === pieceToMove.x && position.y === pieceToMove.y)
      );
    });

    // Update the piece's position
    pieceToMove.x = squareToMoveTo.x;
    pieceToMove.y = squareToMoveTo.y;

    // Check if the piece is a pawn, rook, or king and update the hasMoved property
    if (
      pieceToMove.type === "pawn" ||
      pieceToMove.type === "rook" ||
      pieceToMove.type === "king"
    ) {
      pieceToMove.hasMoved = true;
    }
    game.piecePositions.push(pieceToMove);

    return game;
  } else {
    return null;
  }
}
//Defualt Variables
const defaultPiecePositions = [
  {
    piece: "whiteRook",
    type: "rook",
    x: 0,
    y: 3,
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
    y: 3,
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
