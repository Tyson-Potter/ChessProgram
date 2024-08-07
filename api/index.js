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
    case "bishop":
      gameState = await moveBishop(
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

    case "queen":
      gameState = await moveQueen(
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
function checkLegalGameState(game, playerColor) {
  return true;
}

function moveRook(pieceToMove, squareToMoveTo, playerColor, game) {
  let pieceNotInWay = checkForPiecesInWay(
    pieceToMove,
    squareToMoveTo,
    playerColor,
    game
  );
  if (pieceNotInWay) {
    let potentialGameState = updateGameState(game, pieceToMove, squareToMoveTo);
    let isLegalGameState = checkLegalGameState(potentialGameState, playerColor);
    if (isLegalGameState) {
      return potentialGameState;
    }
  } else {
    return null;
  }
}

function moveBishop(pieceToMove, squareToMoveTo, playerColor, game) {
  console.log("moving bishop");
  const slope =
    (squareToMoveTo.y - pieceToMove.y) / (squareToMoveTo.x - pieceToMove.x);
  //check if the slope is a diagonal
  if (slope != 1 && slope != -1) {
    return null;
  } else {
    //moving right and up
    if (pieceToMove.x < squareToMoveTo.x && pieceToMove.y < squareToMoveTo.y) {
      let pointsArray = [];
      let y = 1;
      for (let i = pieceToMove.x + 1; i < squareToMoveTo.x; i++) {
        pointsArray.push({ x: i, y: pieceToMove.y + y });
        y++;
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
      let returnGameState = updateGameState(game, pieceToMove, squareToMoveTo);
      if (returnGameState != null) {
        return returnGameState;
      }
      console.log("piece not in way");
      //left and down
    } else if (
      pieceToMove.x > squareToMoveTo.x &&
      pieceToMove.y > squareToMoveTo.y
    ) {
      let pointsArray = [];
      let y = pieceToMove.y - 1;
      let x = pieceToMove.x - 1;
      console.log(x);
      for (
        let i = x, j = y;
        i > squareToMoveTo.x && j > squareToMoveTo.y;
        i--, j--
      ) {
        pointsArray.push({ x: i, y: j });
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
      let returnGameState = updateGameState(game, pieceToMove, squareToMoveTo);
      if (returnGameState != null) {
        return returnGameState;
      }
      console.log("piece not in way");
      //left and down
      //left and up
    } else if (
      pieceToMove.x > squareToMoveTo.x &&
      pieceToMove.y < squareToMoveTo.y
    ) {
      let pointsArray = [];
      let y = pieceToMove.y + 1; // Start y from the next point towards squareToMoveTo
      let x = pieceToMove.x - 1; // Start x from the previous point towards squareToMoveTo

      // Loop until x is greater than squareToMoveTo.x and y is less than squareToMoveTo.y
      while (x > squareToMoveTo.x && y < squareToMoveTo.y) {
        pointsArray.push({ x: x, y: y });
        x--; // Decrement x to move left
        y++; // Increment y to move up
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
      let returnGameState = updateGameState(game, pieceToMove, squareToMoveTo);
      if (returnGameState != null) {
        return returnGameState;
      }

      //right and down
    } else if (
      pieceToMove.x < squareToMoveTo.x &&
      pieceToMove.y > squareToMoveTo.y
    ) {
      let pointsArray = [];
      let y = pieceToMove.y - 1; // Start y from the previous point towards squareToMoveTo
      let x = pieceToMove.x + 1; // Start x from the next point towards squareToMoveTo

      // Loop until x is less than squareToMoveTo.x and y is greater than squareToMoveTo.y
      while (x < squareToMoveTo.x && y > squareToMoveTo.y) {
        pointsArray.push({ x: x, y: y });
        x++; // Increment x to move right
        y--; // Decrement y to move down
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
      let returnGameState = updateGameState(game, pieceToMove, squareToMoveTo);
      if (returnGameState != null) {
        return returnGameState;
      }
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
      let returnGameState = updateGameState(game, pieceToMove, squareToMoveTo);
      if (returnGameState != null) {
        return returnGameState;
      }
    }
  }

  //no valid move
  return null;
}

async function moveQueen(pieceToMove, squareToMoveTo, playerColor, game) {
  gameState = await moveRook(pieceToMove, squareToMoveTo, playerColor, game);

  if (gameState != null) {
    return gameState;
  }

  gameState = await moveBishop(pieceToMove, squareToMoveTo, playerColor, game);
  if (gameState != null) {
    return gameState;
  } else {
    return null;
  }
}
//TODO
function moveKing(pieceToMove, squareToMoveTo, playerColor, game) {}
//TODO
function movePawn(pieceToMove, squareToMoveTo, playerColor, game) {
  if (pieceToMove.color === "white") {
    // check if pawn is moving backwards
    if (pieceToMove.y > squareToMoveTo.y) {
      return null;
      //check if moving to far to the left or right
    } else if (Math.abs(pieceToMove.x - squareToMoveTo.x) > 1) {
      return null;
      //check if pawn is trying to move more then 2 square forward
    } else if (
      squareToMoveTo.y - pieceToMove.y > 2 ||
      squareToMoveTo.y - pieceToMove.y < 1
    ) {
      return null;
      //check if pawn is trying to move 2 squares forward more then once
    } else if (squareToMoveTo.y - pieceToMove.y == 2) {
      if (pieceToMove.hasMoved == true) {
        return null;
        //check if peices are in the way of the pawn
      } else {
        let pointsArray = [
          { x: pieceToMove.x, y: pieceToMove.y + 1 },
          { x: pieceToMove.x, y: pieceToMove.y + 2 },
        ];
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

        let returnGameState = updateGameState(
          game,
          pieceToMove,
          squareToMoveTo
        );
        if (returnGameState != null) {
          return returnGameState;
        }
        // no Piece in the way so we can move the pawn
      }
    } else if (squareToMoveTo.y - pieceToMove.y == 1) {
      let pointsArray = [{ x: pieceToMove.x, y: pieceToMove.y + 1 }];
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
      if (squareToMoveTo.y == 7) {
        pieceToMove.type = "queen";
        pieceToMove.piece = "whiteQueen";
      }
      let returnGameState = updateGameState(game, pieceToMove, squareToMoveTo);
      if (returnGameState != null) {
        return returnGameState;
      }
      //attacking diagonally
    } else if (
      pieceToMove.y + 1 == squareToMoveTo.y &&
      pieceToMove.x + 1 == squareToMoveTo.x
    ) {
      console.log("attacking diagonally");
      //check to make sure an enemmy piece is on the square
      for (let i = 0; i < game.piecePositions.length; i++) {
        if (
          game.piecePositions[i].color != pieceToMove.color &&
          game.piecePositions[i].x == squareToMoveTo.x &&
          game.piecePositions[i].y == squareToMoveTo.y
        ) {
          if (squareToMoveTo.y == 7) {
            pieceToMove.type = "queen";
            pieceToMove.piece = "whiteQueen";
          }
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
      //return null if no enemy piece is on the square
      return null;
    }

    //is black
  } else {
    // check if pawn is moving backwards
    if (pieceToMove.y < squareToMoveTo.y) {
      console.log("cant move backwards");
      return null;
      //check if moving to far to the left or right
    } else if (Math.abs(pieceToMove.x - squareToMoveTo.x) > 1) {
      console.log("cant move to far left or right");
      return null;
      //check if pawn is trying to move more then 2 square forward
    } else if (squareToMoveTo.y < pieceToMove.y - 2) {
      console.log("moving more then 2 squares");
      return null;
      //check if pawn is trying to move 2 squares forward more then once
    } else if (pieceToMove.y - squareToMoveTo.y == 2) {
      console.log("moving 2 squares");
      if (pieceToMove.hasMoved == true) {
        return null;
        //check if peices are in the way of the pawn
      } else {
        let pointsArray = [
          { x: pieceToMove.x, y: pieceToMove.y - 1 },
          { x: pieceToMove.x, y: pieceToMove.y - 2 },
        ];

        for (let i = 0; i < game.piecePositions.length; i++) {
          for (let point of pointsArray) {
            if (
              game.piecePositions[i].x == point.x &&
              game.piecePositions[i].y == point.y
            ) {
              console.log("piece in way");
              return null; // Exit if a piece is found in the way
            }
          }
        }
        let returnGameState = updateGameState(
          game,
          pieceToMove,
          squareToMoveTo
        );
        if (returnGameState != null) {
          return returnGameState;
        }
        // no Piece in the way so we can move the pawn
      }
    } else if (pieceToMove.y - squareToMoveTo.y == 1) {
      console.log("moving 1 square");
      let pointsArray = [{ x: pieceToMove.x, y: pieceToMove.y - 1 }];
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
      if (squareToMoveTo.y == 0) {
        pieceToMove.type = "queen";
        pieceToMove.piece = "blackQueen";
      }
      let returnGameState = updateGameState(game, pieceToMove, squareToMoveTo);
      if (returnGameState != null) {
        return returnGameState;
      }
      //attacking diagonally
    } else if (
      pieceToMove.y - 1 == squareToMoveTo.y &&
      pieceToMove.x - 1 == squareToMoveTo.x
    ) {
      //check to make sure an enemmy piece is on the square
      for (let i = 0; i < game.piecePositions.length; i++) {
        if (
          game.piecePositions[i].color != pieceToMove.color &&
          game.piecePositions[i].x == squareToMoveTo.x &&
          game.piecePositions[i].y == squareToMoveTo.y
        ) {
          console.log("attacking diagonally and promoting to queen");
          if (squareToMoveTo.y === 0) {
            pieceToMove.type = "queen";
            pieceToMove.piece = "blackQueen";
          }
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
      //return null if no enemy piece is on the square
      return null;
    }
  }
}
function checkForPiecesInWay(pieceToMove, squareToMoveTo, playerColor, game) {
  switch (pieceToMove.type) {
    case "bishop":

    case "rook":
      //Check if the piece is moving in a straight line
      if (
        pieceToMove.x != squareToMoveTo.x &&
        pieceToMove.y != squareToMoveTo.y
      ) {
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
                return null; // Exit if a piece is found in the way
              }
            }
          }
          return true;
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

          return true;
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
          return true;
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

          return true;
        }
      } else {
        return null;
      }
    case "knight":

    case "queen":

    case "king":

    case "pawn":

    default:
      return null;
  }
}
function updateGameState(game, pieceToMove, squareToMoveTo) {
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
  //change back to x3 and y0
  { piece: "whiteQueen", type: "queen", x: 3, y: 5, color: "white" },
  {
    piece: "whiteKing",
    type: "king",
    x: 4,
    y: 0,
    hasMoved: false,
    color: "white",
  },
  //change my 7 to 0 and x to 5
  { piece: "whiteBishop", type: "bishop", x: 4, y: 3, color: "white" },
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
    //change back to x3 and y1
    piece: "whitePawn",
    type: "pawn",
    x: 7,
    y: 6,
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
    y: 2,
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
    x: 3,
    y: 2,
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
