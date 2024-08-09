const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
require("dotenv").config();
const {
  NotYourTurnError,
  PieceInTheWayError,
  CannotNavigateError,
  GameInactiveError,
} = require("./errors");
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
    app.use((err, req, res, next) => {
      res.status(err.statusCode || 500).json({
        error: err.message,
        type: err.name,
      });
    });
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

    if (game.currentTurn != playerColor) {
      throw new NotYourTurnError("It's not your turn");
    }
    if (game.gameStatus != "active") {
      throw new GameInactiveError("The game is inactive");
    }
    let newGameState = await movePiece(
      pieaceToMove,
      squareToMoveTo,
      playerColor,
      game
    );

    //  if (newGameState != null) {
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
    // }
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
      return gameState;

    case "bishop":
      gameState = await moveBishop(
        pieceToMove,
        squareToMoveTo,
        playerColor,
        game
      );
      return gameState;

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
        throw new CannotNavigateError();
      }

    case "queen":
      gameState = await moveQueen(
        pieceToMove,
        squareToMoveTo,
        playerColor,
        game
      );
      return gameState;
    case "king":
      gameState = moveKing(pieceToMove, squareToMoveTo, playerColor, game);
      return gameState;

    case "pawn":
      gameState = movePawn(pieceToMove, squareToMoveTo, playerColor, game);
      return gameState;
    default:
      console.log("Unknown piece type");
      return null;
  }
}

//TODO
function checkForCheckMate() {}
//TODO
function checkForLegalGameState(game, playerColor) {
  return true;
}

function moveRook(pieceToMove, squareToMoveTo, playerColor, game) {
  validateMovment(pieceToMove, squareToMoveTo, playerColor, game, false);
  let potentialGameState = updateGameState(game, pieceToMove, squareToMoveTo);
  checkForLegalGameState(potentialGameState, playerColor);
  return potentialGameState;
}

function moveBishop(pieceToMove, squareToMoveTo, playerColor, game) {
  validateMovment(pieceToMove, squareToMoveTo, playerColor, game, false);
  let potentialGameState = updateGameState(game, pieceToMove, squareToMoveTo);
  checkForLegalGameState(potentialGameState, playerColor);
  return potentialGameState;
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

  throw new CannotNavigateError();
}
async function moveQueen(pieceToMove, squareToMoveTo, playerColor, game) {
  validateMovment(pieceToMove, squareToMoveTo, playerColor, game, false);
  let potentialGameState = updateGameState(game, pieceToMove, squareToMoveTo);
  checkForLegalGameState(potentialGameState, playerColor);
  return potentialGameState;
}
//TODO
function moveKing(pieceToMove, squareToMoveTo, playerColor, game) {
  let castleType = checkIsCastle(
    pieceToMove,
    squareToMoveTo,
    playerColor,
    game
  );
  if (castleType) {
    let CastleInfo = checkIsLegalCastle(
      castleType,
      pieceToMove,
      squareToMoveTo,
      playerColor,
      game
    );
    let rookToMove = CastleInfo.rookToMove;
    let rookSquareToMoveTo = CastleInfo.rookSquareToMoveTo;
    let potentialGameState = updateGameState(game, pieceToMove, squareToMoveTo);
    potentialGameState = updateGameState(
      potentialGameState,
      getPieceAtPosition(potentialGameState, rookToMove.x, rookToMove.y),
      rookSquareToMoveTo
    );
    return potentialGameState;
  } else {
    //normal king movment
    validateMovment(pieceToMove, squareToMoveTo, playerColor, game, false);
    let potentialGameState = updateGameState(game, pieceToMove, squareToMoveTo);
    checkForLegalGameState(potentialGameState, playerColor);
    return potentialGameState;
  }
}
function movePawn(pieceToMove, squareToMoveTo, playerColor, game) {
  validateMovment(pieceToMove, squareToMoveTo, playerColor, game, false);
  if (pieceToMove.color === "white" && squareToMoveTo.y === 7) {
    pieceToMove.type = "queen";
    pieceToMove.piece = "whiteQueen";
  } else if (pieceToMove.color === "black" && squareToMoveTo.y === 0) {
    pieceToMove.type = "queen";
    pieceToMove.piece = "blackQueen";
  }
  let potentialGameState = updateGameState(game, pieceToMove, squareToMoveTo);
  checkForLegalGameState(potentialGameState, playerColor);
  return potentialGameState;
}
function validateMovment(
  pieceToMove,
  squareToMoveTo,
  playerColor,
  game,
  checkSafety
) {
  switch (pieceToMove.type) {
    case "bishop":
      let slope =
        (squareToMoveTo.y - pieceToMove.y) / (squareToMoveTo.x - pieceToMove.x);
      //check if the slope is a diagonal
      if (slope != 1 && slope != -1) {
        if (checkSafety) {
          return false;
        } else {
          throw new CannotNavigateError();
        }
      } else {
        //moving right and up
        if (
          pieceToMove.x < squareToMoveTo.x &&
          pieceToMove.y < squareToMoveTo.y
        ) {
          let pointsArray = [];
          let y = 1;
          for (let i = pieceToMove.x + 1; i < squareToMoveTo.x; i++) {
            pointsArray.push({ x: i, y: pieceToMove.y + y });
            y++;
          }

          if (checkSafety) {
            //Piece is not in the way so we can move
            if (!checkForPiecesInWay(game, pointsArray, checkSafety)) {
              return true;
            } else {
              return false;
            }
          } else {
            checkForPiecesInWay(game, pointsArray);
            return;
          }
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
          if (checkSafety) {
            //Piece is not in the way so we can move
            if (!checkForPiecesInWay(game, pointsArray, checkSafety)) {
              return true;
            } else {
              return false;
            }
          } else {
            checkForPiecesInWay(game, pointsArray);
            return;
          }

          //left and up
        } else if (
          pieceToMove.x > squareToMoveTo.x &&
          pieceToMove.y < squareToMoveTo.y
        ) {
          let pointsArray = [];
          let y = pieceToMove.y + 1; // Start y from the next point towards squareToMoveTo
          let x = pieceToMove.x - 1; // Start x from the previous point towards squareToMoveTo

          while (x > squareToMoveTo.x && y < squareToMoveTo.y) {
            pointsArray.push({ x: x, y: y });
            x--; // Decrement x to move left
            y++; // Increment y to move up
          }
          if (checkSafety) {
            //Piece is not in the way so we can move
            if (!checkForPiecesInWay(game, pointsArray, checkSafety)) {
              return true;
            } else {
              return false;
            }
          } else {
            checkForPiecesInWay(game, pointsArray);
            return;
          }
          //right and down
        } else if (
          pieceToMove.x < squareToMoveTo.x &&
          pieceToMove.y > squareToMoveTo.y
        ) {
          let pointsArray = [];
          let y = pieceToMove.y - 1; // Start y from the previous point towards squareToMoveTo
          let x = pieceToMove.x + 1; // Start x from the next point towards squareToMoveTo

          while (x < squareToMoveTo.x && y > squareToMoveTo.y) {
            pointsArray.push({ x: x, y: y });
            x++; // Increment x to move right
            y--; // Decrement y to move down
          }
          if (checkSafety) {
            //Piece is not in the way so we can move
            if (!checkForPiecesInWay(game, pointsArray, checkSafety)) {
              return true;
            } else {
              return false;
            }
          } else {
            checkForPiecesInWay(game, pointsArray);
            return;
          }
        }
      }
    case "rook":
      //Check if the piece is moving in a straight line
      if (
        pieceToMove.x != squareToMoveTo.x &&
        pieceToMove.y != squareToMoveTo.y
      ) {
        if (checkSafety) {
          return false;
        } else {
          throw new CannotNavigateError();
        }
        throw new CannotNavigateError();
      } else if (pieceToMove.x != squareToMoveTo.x) {
        //moving on the x axis to the left
        if (pieceToMove.x > squareToMoveTo.x) {
          let pointsArray = [];
          for (let i = squareToMoveTo.x + 1; i < pieceToMove.x; i++) {
            pointsArray.push({ x: i, y: pieceToMove.y });
          }
          if (checkSafety) {
            //Piece is not in the way so we can move
            if (!checkForPiecesInWay(game, pointsArray, checkSafety)) {
              return true;
            } else {
              return false;
            }
          } else {
            checkForPiecesInWay(game, pointsArray);
            return;
          }
          ///////////////////////////////////////////////////////
        } else if (pieceToMove.x < squareToMoveTo.x) {
          let pointsArray = [];
          for (let i = pieceToMove.x + 1; i < squareToMoveTo.x; i++) {
            pointsArray.push({ x: i, y: pieceToMove.y });
          }
          if (checkSafety) {
            //Piece is not in the way so we can move
            if (!checkForPiecesInWay(game, pointsArray, checkSafety)) {
              return true;
            } else {
              return false;
            }
          } else {
            checkForPiecesInWay(game, pointsArray);
            return;
          }
        }
      } else if (pieceToMove.y != squareToMoveTo.y) {
        //
        if (pieceToMove.y > squareToMoveTo.y) {
          let pointsArray = [];
          for (let i = squareToMoveTo.y + 1; i < pieceToMove.y; i++) {
            pointsArray.push({ x: pieceToMove.x, y: i });
          }
          checkForPiecesInWay(game, pointsArray);

          return true;
        } else if (pieceToMove.y < squareToMoveTo.y) {
          let pointsArray = [];
          for (let i = pieceToMove.y + 1; i < squareToMoveTo.y; i++) {
            pointsArray.push({ x: pieceToMove.x, y: i });
          }
          if (checkSafety) {
            //Piece is not in the way so we can move
            if (!checkForPiecesInWay(game, pointsArray, checkSafety)) {
              return true;
            } else {
              return false;
            }
          } else {
            checkForPiecesInWay(game, pointsArray);
            return;
          }
        }
      }
    case "queen":
      let slopeQueen =
        (squareToMoveTo.y - pieceToMove.y) / (squareToMoveTo.x - pieceToMove.x);
      if (
        slopeQueen != 1 &&
        slopeQueen != -1 &&
        pieceToMove.x != squareToMoveTo.x &&
        pieceToMove.y != squareToMoveTo.y
      ) {
        if (checkSafety) {
          return false;
        } else {
          throw new CannotNavigateError();
        }
      } else if (slopeQueen == 1 || slopeQueen == -1) {
        console.log("Bishop Movment for queen");
        if (
          pieceToMove.x < squareToMoveTo.x &&
          pieceToMove.y < squareToMoveTo.y
        ) {
          let pointsArray = [];
          let y = 1;
          for (let i = pieceToMove.x + 1; i < squareToMoveTo.x; i++) {
            pointsArray.push({ x: i, y: pieceToMove.y + y });
            y++;
          }

          if (checkSafety) {
            //Piece is not in the way so we can move
            if (!checkForPiecesInWay(game, pointsArray, checkSafety)) {
              return true;
            } else {
              return false;
            }
          } else {
            checkForPiecesInWay(game, pointsArray);
            return;
          }
        } else if (
          pieceToMove.x > squareToMoveTo.x &&
          pieceToMove.y > squareToMoveTo.y
        ) {
          console.log("left and down");
          let pointsArray = [];
          let y = pieceToMove.y;
          let x = pieceToMove.x - 1;
          console.log(x);
          for (
            let i = x, j = y;
            i > squareToMoveTo.x && j > squareToMoveTo.y;
            i--, j--
          ) {
            pointsArray.push({ x: i, y: j - 1 });
          }

          if (checkSafety) {
            //Piece is not in the way so we can move
            if (!checkForPiecesInWay(game, pointsArray, checkSafety)) {
              return true;
            } else {
              return false;
            }
          } else {
            checkForPiecesInWay(game, pointsArray);
            return;
          }

          //left and up
        } else if (
          pieceToMove.x > squareToMoveTo.x &&
          pieceToMove.y < squareToMoveTo.y
        ) {
          let pointsArray = [];
          let y = pieceToMove.y; // Start y from the next point towards squareToMoveTo
          let x = pieceToMove.x - 1; // Start x from the previous point towards squareToMoveTo

          while (x > squareToMoveTo.x && y < squareToMoveTo.y) {
            pointsArray.push({ x: x, y: y + 1 });
            x--; // Decrement x to move left
            y++; // Increment y to move up
          }
          if (checkSafety) {
            //Piece is not in the way so we can move
            if (!checkForPiecesInWay(game, pointsArray, checkSafety)) {
              return true;
            } else {
              return false;
            }
          } else {
            checkForPiecesInWay(game, pointsArray);
            return;
          }
          //right and down
        } else if (
          pieceToMove.x < squareToMoveTo.x &&
          pieceToMove.y > squareToMoveTo.y
        ) {
          let pointsArray = [];
          let y = pieceToMove.y - 1; // Start y from the previous point towards squareToMoveTo
          let x = pieceToMove.x + 1; // Start x from the next point towards squareToMoveTo

          while (x < squareToMoveTo.x && y > squareToMoveTo.y) {
            pointsArray.push({ x: x, y: y });
            x++; // Increment x to move right
            y--; // Decrement y to move down
          }
          if (checkSafety) {
            //Piece is not in the way so we can move
            if (!checkForPiecesInWay(game, pointsArray, checkSafety)) {
              return true;
            } else {
              return false;
            }
          } else {
            checkForPiecesInWay(game, pointsArray);
            return;
          }
        }
      } else if (
        pieceToMove.x != squareToMoveTo.x ||
        pieceToMove.y != squareToMoveTo.y
      ) {
        if (pieceToMove.x != squareToMoveTo.x) {
          //moving on the x axis to the left
          if (pieceToMove.x > squareToMoveTo.x) {
            let pointsArray = [];
            for (let i = squareToMoveTo.x + 1; i < pieceToMove.x; i++) {
              pointsArray.push({ x: i, y: pieceToMove.y });
            }
            if (checkSafety) {
              //Piece is not in the way so we can move
              if (!checkForPiecesInWay(game, pointsArray, checkSafety)) {
                return true;
              } else {
                return false;
              }
            } else {
              checkForPiecesInWay(game, pointsArray);
              return;
            }
            ///////////////////////////////////////////////////////
          } else if (pieceToMove.x < squareToMoveTo.x) {
            let pointsArray = [];
            for (let i = pieceToMove.x + 1; i < squareToMoveTo.x; i++) {
              pointsArray.push({ x: i, y: pieceToMove.y });
            }
            if (checkSafety) {
              //Piece is not in the way so we can move
              if (!checkForPiecesInWay(game, pointsArray, checkSafety)) {
                return true;
              } else {
                return false;
              }
            } else {
              checkForPiecesInWay(game, pointsArray);
              return;
            }
          }
        } else if (pieceToMove.y != squareToMoveTo.y) {
          //
          if (pieceToMove.y > squareToMoveTo.y) {
            let pointsArray = [];
            for (let i = squareToMoveTo.y + 1; i < pieceToMove.y; i++) {
              pointsArray.push({ x: pieceToMove.x, y: i });
            }
            if (checkSafety) {
              //Piece is not in the way so we can move
              if (!checkForPiecesInWay(game, pointsArray, checkSafety)) {
                return true;
              } else {
                return false;
              }
            } else {
              checkForPiecesInWay(game, pointsArray);
              return;
            }
          } else if (pieceToMove.y < squareToMoveTo.y) {
            let pointsArray = [];
            for (let i = pieceToMove.y + 1; i < squareToMoveTo.y; i++) {
              pointsArray.push({ x: pieceToMove.x, y: i });
            }
            checkForPiecesInWay(game, pointsArray);
            return true;
          }
        }
      }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    case "king":
      const kingMoves = [
        { x: +1, y: 0 }, // Right
        { x: -1, y: 0 }, // Left
        { x: 0, y: +1 }, // Up
        { x: 0, y: -1 }, // Down
        { x: +1, y: +1 }, // Up-Right
        { x: +1, y: -1 }, // Down-Right
        { x: -1, y: +1 }, // Up-Left
        { x: -1, y: -1 }, // Down-Left
      ];
      if (playerColor === "white") {
        //is black
      } else {
        return;
      }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    case "pawn":
      if (pieceToMove.color === "white") {
        // check if pawn is moving backwards
        if (pieceToMove.y > squareToMoveTo.y) {
          throw new CannotNavigateError();
          //check if moving to far to the left or right
        } else if (Math.abs(pieceToMove.x - squareToMoveTo.x) > 1) {
          throw new CannotNavigateError();
          //check if pawn is trying to move more then 2 square forward
        } else if (
          squareToMoveTo.y - pieceToMove.y > 2 ||
          squareToMoveTo.y - pieceToMove.y < 1
        ) {
          throw new CannotNavigateError();
          //check if pawn is trying to move 2 squares forward more then once
        } else if (squareToMoveTo.y - pieceToMove.y == 2) {
          if (pieceToMove.hasMoved == true) {
            throw new CannotNavigateError();
            //check if peices are in the way of the pawn
          } else {
            let pointsArray = [
              { x: pieceToMove.x, y: pieceToMove.y + 1 },
              { x: pieceToMove.x, y: pieceToMove.y + 2 },
            ];
            checkForPiecesInWay(game, pointsArray);
            return true;
            // no Piece in the way so we can move the pawn
          }
        } else if (
          squareToMoveTo.x === pieceToMove.x &&
          squareToMoveTo.y - pieceToMove.y == 1
        ) {
          console.log("moving 1 square forward");
          let pointsArray = [{ x: pieceToMove.x, y: pieceToMove.y + 1 }];
          checkForPiecesInWay(game, pointsArray);
          return true;

          //attacking diagonally to the right
        } else if (
          pieceToMove.y + 1 == squareToMoveTo.y &&
          pieceToMove.x + 1 == squareToMoveTo.x
        ) {
          pointsArray = [{ x: pieceToMove.x + 1, y: pieceToMove.y + 1 }];
          console.log("attacking diagonally right");
          //check to make sure an enemmy piece is on the square
          console.log(pointsArray);
          for (let i = 0; i < game.piecePositions.length; i++) {
            for (let point of pointsArray) {
              if (
                game.piecePositions[i].x == point.x &&
                game.piecePositions[i].y == point.y
              ) {
                return true;
              }
            }
          }
          throw new CannotNavigateError();
          //attacking diagonally to the left
        } else if (
          pieceToMove.y + 1 == squareToMoveTo.y &&
          pieceToMove.x - 1 == squareToMoveTo.x
        ) {
          pointsArray = [{ x: pieceToMove.x - 1, y: pieceToMove.y + 1 }];
          console.log("attacking diagonally left");
          console.log(pointsArray);
          for (let i = 0; i < game.piecePositions.length; i++) {
            for (let point of pointsArray) {
              if (
                game.piecePositions[i].x == point.x &&
                game.piecePositions[i].y == point.y
              ) {
                return true;
              }
            }
          }
          throw new CannotNavigateError();
        }

        //is black
      } else {
        console.log();
        // check if pawn is moving backwards
        if (pieceToMove.y < squareToMoveTo.y) {
          console.log("cant move backwards");
          throw new CannotNavigateError();
          //check if moving to far to the left or right
        } else if (Math.abs(pieceToMove.x - squareToMoveTo.x) > 1) {
          console.log("cant move to far left or right");
          throw new CannotNavigateError();
          //check if pawn is trying to move more then 2 square forward
        } else if (squareToMoveTo.y < pieceToMove.y - 2) {
          console.log("moving more then 2 squares");
          throw new CannotNavigateError();
          //check if pawn is trying to move 2 squares forward more then once
        } else if (pieceToMove.y - squareToMoveTo.y === 2) {
          console.log("moving 2 squares black");
          if (pieceToMove.hasMoved === true) {
            throw new CannotNavigateError();
            //check if peices are in the way of the pawn
          } else {
            let pointsArray = [
              { x: pieceToMove.x, y: pieceToMove.y - 1 },
              { x: pieceToMove.x, y: pieceToMove.y - 2 },
            ];

            checkForPiecesInWay(game, pointsArray);
            return true;
            // no Piece in the way so we can move the pawn
          }
        } else if (
          squareToMoveTo.x === pieceToMove.x &&
          squareToMoveTo.y + 1 == pieceToMove.y
        ) {
          console.log("moving 1 square forward black");
          let pointsArray = [{ x: pieceToMove.x, y: pieceToMove.y - 1 }];
          checkForPiecesInWay(game, pointsArray);
          return true;

          //attacking diagonally to the right
        } else if (
          pieceToMove.y - 1 == squareToMoveTo.y &&
          pieceToMove.x - 1 == squareToMoveTo.x
        ) {
          pointsArray = [{ x: pieceToMove.x - 1, y: pieceToMove.y - 1 }];
          console.log("attacking diagonally right");
          //check to make sure an enemmy piece is on the square
          console.log(pointsArray);
          for (let i = 0; i < game.piecePositions.length; i++) {
            for (let point of pointsArray) {
              if (
                game.piecePositions[i].x == point.x &&
                game.piecePositions[i].y == point.y
              ) {
                return true;
              }
            }
          }
          throw new CannotNavigateError();
          //attacking diagonally to the left
        } else if (
          pieceToMove.y - 1 == squareToMoveTo.y &&
          pieceToMove.x + 1 == squareToMoveTo.x
        ) {
          pointsArray = [{ x: pieceToMove.x + 1, y: pieceToMove.y - 1 }];
          console.log("attacking diagonally left black");
          //check to make sure an enemmy piece is on the square
          console.log(pointsArray);
          for (let i = 0; i < game.piecePositions.length; i++) {
            for (let point of pointsArray) {
              if (
                game.piecePositions[i].x == point.x &&
                game.piecePositions[i].y == point.y
              ) {
                return true;
              }
            }
          }
          throw new CannotNavigateError();
        }
      }
  }
}
function getPieceAtPosition(game, x, y) {
  for (let i = 0; i < game.piecePositions.length; i++) {
    if (game.piecePositions[i].x === x && game.piecePositions[i].y === y) {
      return game.piecePositions[i];
    }
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
function checkForPiecesInWay(game, pointsArray, checkSafety) {
  for (let i = 0; i < game.piecePositions.length; i++) {
    for (let point of pointsArray) {
      if (
        game.piecePositions[i].x == point.x &&
        game.piecePositions[i].y == point.y
      ) {
        if (checkSafety) {
          console.log("piece in the way");
          return true;
        } else {
          throw new PieceInTheWayError();
        }
      }
    }
  }
  console.log("no piece in the way");
  return false;
}

//TODO
function checkIfEnemyPieceCanAttackSquare(game, playerColor, point, kingMove) {
  console.log("checking if enemy piece can attack square " + point);
  //if a king move you have to check pawns and enemmy king otherwise you dont
  if (kingMove) {
    //add all below and pwan/king move
  } else {
    for (let i = 0; i < game.piecePositions.length; i++) {
      if (game.piecePositions[i].color != playerColor) {
        switch (game.piecePositions[i].type) {
          case "bishop":
            if (
              validateMovment(
                game.piecePositions[i],
                point,
                playerColor,
                game,
                true
              )
            ) {
              console.log("bishop can attack square") + point;
              throw new CannotNavigateError();
            }
            break;
          case "rook":
            if (
              validateMovment(
                game.piecePositions[i],
                point,
                playerColor,
                game,
                true
              )
            ) {
              console.log("rook can attack square") + point;
              throw new CannotNavigateError();
            }
            break;
          case "queen":
            if (
              validateMovment(
                game.piecePositions[i],
                point,
                playerColor,
                game,
                true
              )
            ) {
              console.log("rook can attack square") + point;
              throw new CannotNavigateError();
            }
            break;
        }
      }
    }
  }
}
function checkForRookInRightPositionAndHasNotMoved(
  game,
  playerColor,
  correctLocation
) {
  for (let i = 0; i < game.piecePositions.length; i++) {
    if (
      game.piecePositions[i].x == correctLocation.x &&
      game.piecePositions[i].y == correctLocation.y
    ) {
      if (
        game.piecePositions[i].type == "rook" &&
        game.piecePositions[i].color === playerColor &&
        game.piecePositions[i].hasMoved === false
      ) {
        return true;
      }
    }
  }
  throw new CannotNavigateError();
}
function checkIsLegalCastle(
  castleInfo,
  pieceToMove,
  squareToMoveTo,
  playerColor,
  game
) {
  console.log(castleInfo);
  if (playerColor === "white") {
    if (pieceToMove.hasMoved === true) {
      throw new CannotNavigateError();
    }

    let pointsArray = [];
    let rookLocation;

    switch (castleInfo) {
      case "kingSide":
        console.log("white is castling kingside");
        let pointsArrayKing = [
          { x: 5, y: 0 },
          { x: 6, y: 0 },
        ];
        //check if there are pieces in the way of the king
        checkForPiecesInWay(game, pointsArrayKing, false);
        //check if rook is in the right position and has not moved
        let rookLocationWhite = { x: 7, y: 0 };
        checkForRookInRightPositionAndHasNotMoved(
          game,
          playerColor,
          rookLocationWhite
        );
        for (point of pointsArrayKing) {
          checkIfEnemyPieceCanAttackSquare(game, playerColor, point, false);
        }
        return {
          rookToMove: { x: 7, y: 0 },
          rookSquareToMoveTo: { x: 5, y: 0 },
        };

      case "queenSide":
        console.log("white is castling queenside");
        let pointsArray = [
          {
            x: 1,
            y: 0,
          },
          { x: 2, y: 0 },
          { x: 3, y: 0 },
        ];
        checkForPiecesInWay(game, pointsArray);
        //check if rook is in the right position and has not moved
        let rookLocation = { x: 0, y: 0 };
        checkForRookInRightPositionAndHasNotMoved(
          game,
          playerColor,
          rookLocation
        );
        for (point of pointsArray) {
          checkIfEnemyPieceCanAttackSquare(game, playerColor, point, false);
        }
        return {
          rookToMove: { x: 0, y: 0 },
          rookSquareToMoveTo: { x: 3, y: 0 },
        };
    }
    //black
  } else {
    switch (castleInfo) {
      case "kingSide":
        console.log("black is castling kingside");
        let pointsArray = [
          { x: 5, y: 7 }, // The points the king moves through
          { x: 6, y: 7 },
        ];
        // Check if there are pieces in the way of the king
        checkForPiecesInWay(game, pointsArray);
        // Check if rook is in the right position and has not moved
        let rookLocation = { x: 7, y: 7 };
        checkForRookInRightPositionAndHasNotMoved(
          game,
          playerColor,
          rookLocation
        );
        for (let point of pointsArray) {
          checkIfEnemyPieceCanAttackSquare(game, playerColor, point, false);
        }
        return {
          rookToMove: { x: 7, y: 7 },
          rookSquareToMoveTo: { x: 5, y: 7 },
        };

      case "queenSide":
        console.log("black is castling queenside");
        let pointsArrayQueen = [
          { x: 1, y: 7 }, // The points the king moves through
          { x: 2, y: 7 },
          { x: 3, y: 7 },
        ];
        // Check if there are pieces in the way of the king
        checkForPiecesInWay(game, pointsArrayQueen);
        // Check if rook is in the right position and has not moved
        let rookLocationQueen = { x: 0, y: 7 };
        checkForRookInRightPositionAndHasNotMoved(
          game,
          playerColor,
          rookLocationQueen
        );
        for (let point of pointsArrayQueen) {
          checkIfEnemyPieceCanAttackSquare(game, playerColor, point, false);
        }
        return {
          rookToMove: { x: 0, y: 7 },
          rookSquareToMoveTo: { x: 3, y: 7 },
        };
    }
  }
}

//todo
function checkIsCastle(pieceToMove, squareToMoveTo, playerColor, game) {
  let returnInfo = "";
  //check for castling logic white
  if (playerColor === "white") {
    if (
      squareToMoveTo.x === 6 &&
      squareToMoveTo.y === 0 &&
      pieceToMove.x === 4 &&
      pieceToMove.y === 0
    ) {
      //white king side castling
      returnInfo = "kingSide";
      return returnInfo;
    } else if (
      squareToMoveTo.x === 2 &&
      squareToMoveTo.y === 0 &&
      pieceToMove.x === 4 &&
      pieceToMove.y === 0
    ) {
      returnInfo = "queenSide";
      return returnInfo;

      //is black
    }
    throw new CannotNavigateError();
  } else {
    if (
      squareToMoveTo.x === 6 &&
      squareToMoveTo.y === 7 && // y-coordinate for black
      pieceToMove.x === 4 &&
      pieceToMove.y === 7 // y-coordinate for black
    ) {
      console.log("black king side castling");
      // Black king-side castling
      returnInfo = "kingSide";
      return returnInfo;
    } else if (
      squareToMoveTo.x === 2 &&
      squareToMoveTo.y === 7 && // y-coordinate for black
      pieceToMove.x === 4 &&
      pieceToMove.y === 7 // y-coordinate for black
    ) {
      // Black queen-side castling
      returnInfo = "queenSide";
      return returnInfo;
    }
  }
}
//Defualt Variables
// const defaultPiecePositions = [
//   {
//     piece: "whiteRook",
//     type: "rook",
//     x: 2,
//     y: 3,
//     hasMoved: false,
//     color: "white",
//   },
//   {
//     piece: "whiteBishop",
//     type: "bishop",
//     x: 3,
//     y: 3,
//     color: "white",
//   },
//   // Black pieces surrounding the white rook and white bishop
//   {
//     piece: "blackPawn",
//     type: "pawn",
//     x: 1,
//     y: 2,
//     hasMoved: false,
//     color: "black",
//   },
//   {
//     piece: "blackPawn",
//     type: "pawn",
//     x: 2,
//     y: 2,
//     hasMoved: false,
//     color: "black",
//   },
//   {
//     piece: "blackPawn",
//     type: "pawn",
//     x: 3,
//     y: 2,
//     hasMoved: false,
//     color: "black",
//   },
//   {
//     piece: "blackPawn",
//     type: "pawn",
//     x: 4,
//     y: 2,
//     hasMoved: false,
//     color: "black",
//   },
//   {
//     piece: "blackPawn",
//     type: "pawn",
//     x: 1,
//     y: 3,
//     hasMoved: false,
//     color: "black",
//   },
//   {
//     piece: "blackPawn",
//     type: "pawn",
//     x: 4,
//     y: 3,
//     hasMoved: false,
//     color: "black",
//   },
//   {
//     piece: "blackPawn",
//     type: "pawn",
//     x: 1,
//     y: 4,
//     hasMoved: false,
//     color: "black",
//   },
//   {
//     piece: "blackPawn",
//     type: "pawn",
//     x: 2,
//     y: 4,
//     hasMoved: false,
//     color: "black",
//   },
//   {
//     piece: "blackPawn",
//     type: "pawn",
//     x: 3,
//     y: 4,
//     hasMoved: false,
//     color: "black",
//   },
//   {
//     piece: "blackPawn",
//     type: "pawn",
//     x: 4,
//     y: 4,
//     hasMoved: false,
//     color: "black",
//   },

//   // Other pieces
//   { piece: "whiteKnight", type: "knight", x: 1, y: 0, color: "white" },
//   { piece: "whiteQueen", type: "queen", x: 3, y: 5, color: "white" },
//   {
//     piece: "whiteKing",
//     type: "king",
//     x: 4,
//     y: 0,
//     hasMoved: false,
//     color: "white",
//   },
//   { piece: "whiteKnight", type: "knight", x: 6, y: 0, color: "white" },
//   {
//     piece: "whiteRook",
//     type: "rook",
//     x: 7,
//     y: 0,
//     hasMoved: false,
//     color: "white",
//   },
//   {
//     piece: "whitePawn",
//     type: "pawn",
//     x: 0,
//     y: 1,
//     hasMoved: false,
//     color: "white",
//   },
//   {
//     piece: "whitePawn",
//     type: "pawn",
//     x: 1,
//     y: 1,
//     hasMoved: false,
//     color: "white",
//   },
//   {
//     piece: "whitePawn",
//     type: "pawn",
//     x: 2,
//     y: 1,
//     hasMoved: false,
//     color: "white",
//   },
//   {
//     piece: "whitePawn",
//     type: "pawn",
//     x: 7,
//     y: 6,
//     hasMoved: false,
//     color: "white",
//   },
//   {
//     piece: "whitePawn",
//     type: "pawn",
//     x: 4,
//     y: 1,
//     hasMoved: false,
//     color: "white",
//   },
//   {
//     piece: "whitePawn",
//     type: "pawn",
//     x: 5,
//     y: 2,
//     hasMoved: false,
//     color: "white",
//   },
//   {
//     piece: "whitePawn",
//     type: "pawn",
//     x: 6,
//     y: 1,
//     hasMoved: false,
//     color: "white",
//   },
//   {
//     piece: "whitePawn",
//     type: "pawn",
//     x: 7,
//     y: 1,
//     hasMoved: false,
//     color: "white",
//   },
//   {
//     piece: "blackRook",
//     type: "rook",
//     x: 0,
//     y: 7,
//     hasMoved: false,
//     color: "black",
//   },
//   { piece: "blackKnight", type: "knight", x: 1, y: 7, color: "black" },
//   { piece: "blackBishop", type: "bishop", x: 2, y: 7, color: "black" },
//   { piece: "blackQueen", type: "queen", x: 3, y: 7, color: "black" },
//   {
//     piece: "blackKing",
//     type: "king",
//     x: 4,
//     y: 7,
//     hasMoved: false,
//     color: "black",
//   },
//   { piece: "blackBishop", type: "bishop", x: 5, y: 7, color: "black" },
//   { piece: "blackKnight", type: "knight", x: 6, y: 7, color: "black" },
//   {
//     piece: "blackRook",
//     type: "rook",
//     x: 7,
//     y: 3,
//     hasMoved: false,
//     color: "black",
//   },
//   {
//     piece: "blackPawn",
//     type: "pawn",
//     x: 0,
//     y: 6,
//     hasMoved: false,
//     color: "black",
//   },
//   {
//     piece: "blackPawn",
//     type: "pawn",
//     x: 3,
//     y: 2,
//     hasMoved: false,
//     color: "black",
//   },
//   {
//     piece: "blackPawn",
//     type: "pawn",
//     x: 2,
//     y: 6,
//     hasMoved: false,
//     color: "black",
//   },
//   {
//     piece: "blackPawn",
//     type: "pawn",
//     x: 3,
//     y: 6,
//     hasMoved: false,
//     color: "black",
//   },
//   {
//     piece: "blackPawn",
//     type: "pawn",
//     x: 4,
//     y: 6,
//     hasMoved: false,
//     color: "black",
//   },
//   {
//     piece: "blackPawn",
//     type: "pawn",
//     x: 5,
//     y: 6,
//     hasMoved: false,
//     color: "black",
//   },
//   {
//     piece: "blackPawn",
//     type: "pawn",
//     x: 6,
//     y: 6,
//     hasMoved: false,
//     color: "black",
//   },
//   {
//     piece: "blackPawn",
//     type: "pawn",
//     x: 7,
//     y: 6,
//     hasMoved: false,
//     color: "black",
//   },
// ];

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
// //base set up
const defaultPiecePositions = [
  // White pieces
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
  { piece: "whiteQueen", type: "queen", x: 3, y: 0, color: "white" }, // Corrected back to (x: 3, y: 0)
  {
    piece: "whiteKing",
    type: "king",
    x: 4,
    y: 0,
    hasMoved: false,
    color: "white",
  },
  { piece: "whiteBishop", type: "bishop", x: 5, y: 0, color: "white" }, // Changed back to (x: 5, y: 0)
  { piece: "whiteKnight", type: "knight", x: 6, y: 0, color: "white" },
  {
    piece: "whiteRook",
    type: "rook",
    x: 7,
    y: 0,
    hasMoved: false,
    color: "white",
  },

  // White pawns
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
  }, // Corrected back to (x: 3, y: 1)
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

  // Black pieces
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

  // Black pawns
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
