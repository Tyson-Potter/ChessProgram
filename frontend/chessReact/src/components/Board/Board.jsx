/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import "../Board/board.css";
import blackBishop from "/src/assets/images/black-bishop.png";
import blackKing from "/src/assets/images/black-king.png";
import blackKnight from "/src/assets/images/black-knight.png";
import blackPawn from "/src/assets/images/black-pawn.png";
import blackQueen from "/src/assets/images/black-queen.png";
import blackRook from "/src/assets/images/black-rook.png";
import whiteBishop from "/src/assets/images/white-bishop.png";
import whiteKing from "/src/assets/images/white-king.png";
import whiteKnight from "/src/assets/images/white-knight.png";
import whitePawn from "/src/assets/images/white-pawn.png";
import whiteQueen from "/src/assets/images/white-queen.png";
import whiteRook from "/src/assets/images/white-rook.png";

function Board({ gameState, setGameState }) {
 
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [selectedSquare, setSelectedSquare] = useState(null);

  

  

  if (gameState != false) {
    let board = gameState.board;
    let pieces = gameState.piecePositions;

    const pieceImages = {
      blackBishop: blackBishop,
      blackKing: blackKing,
      blackKnight: blackKnight,
      blackPawn: blackPawn,
      blackQueen: blackQueen,
      blackRook: blackRook,
      whiteBishop: whiteBishop,
      whiteKing: whiteKing,
      whiteKnight: whiteKnight,
      whitePawn: whitePawn,
      whiteQueen: whiteQueen,
      whiteRook: whiteRook,
    };

    const handleClick = async (square, event) => {
      // if not current players turn do nothing
      if (gameState.currentTurn != localStorage.getItem("color")) {
        console.log("Not your turn");
      } else {
        //Check if Clicked square has a pieace on it
        const clickedPiece = pieces.find(
          (obj) => obj.x === square.x && obj.y === square.y
        );
        let buttonElement = event.target;

        if (clickedPiece) {
          console.log("they clicked" + clickedPiece);

          //Check if they clicked thier piece or an enempy piece
          if (clickedPiece.color === localStorage.getItem("color")) {
            //no prior Piece selcted so the current needs to be.
            if (selectedPiece === null) {
              buttonElement.classList.add("selectedPiece");
              setSelectedPiece(clickedPiece);
              //trying to unselect a pieace
            } else if (
              clickedPiece.x == selectedPiece.x &&
              clickedPiece.y == selectedPiece.y
            ) {
              buttonElement.classList.remove("selectedPiece");
              setSelectedPiece(null);
            }
          } else {
            const clickedSquare = pieces.find(
              (obj) => obj.x === square.x && obj.y === square.y
            );
            let response = await move(
              selectedPiece,
              clickedSquare,
              gameState._id
            );
            gameState.piecePositions = response.piecePositions;
            setSelectedPiece(null);
          }
        } else {
          //clicked an empty square
          if (selectedPiece != null) {
            const clickedSquare = board.find(
              (obj) => obj.x === square.x && obj.y === square.y
            );
            let response = await move(
              selectedPiece,
              clickedSquare,
              gameState._id
            );
            gameState.piecePositions = response.piecePositions;
            setSelectedPiece(null);
          } else {
            //Do Nothing
          }
        }
      }
    };

    if (localStorage.getItem("color") !== "white") {
      board = [...board].reverse();
    }

    const getPieceAtPosition = (x, y,gettingKing) => {
      if(gettingKing){
        return pieces.find((piece) => piece.x === x && piece.y === y) || null;
      }
      const piece = pieces.find((piece) => piece.x === x && piece.y === y);
      
      return piece ? piece.piece : null;
      
    };
    return (
      <>
      {console.log(pieces)}
        <h1>You Are {localStorage.getItem("color")}</h1>
        <div className="board-container">
          
          <div className="grid">
         
            {board.map((square) => (
            
              <button
                onClick={() => handleClick(square, event)}
                key={`${square.x},${square.y}`}
                id={`${square.x},${square.y}`}
                className={`${square.color} cell ${
                  getPieceAtPosition(square.x, square.y, true)?.isInCheck === true
                    ? 'in-check'
                    : ''
                }`}
                
              >
                {getPieceAtPosition(square.x, square.y) ? (
                  <img
                    src={pieceImages[getPieceAtPosition(square.x, square.y)]}
                    alt={getPieceAtPosition(square.x, square.y)}
                  />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }
}
async function move(pieaceToMove, squareToMoveTo, gameId) {
  const response = await fetch("http://localhost:3000/move", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pieaceToMove: pieaceToMove,
      playerColor: localStorage.getItem("color"),
      squareToMoveTo: squareToMoveTo,
      gameId: gameId,
    }),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`Failed to create game: ${errorMessage}`);
  }

  const result = await response.json();

  return result;
}
export default Board;
