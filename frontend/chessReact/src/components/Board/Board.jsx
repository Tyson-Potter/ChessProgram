/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
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

function Board(gameState) {
  if (gameState != false) {
    let board = gameState.gameState.board;
    let pieces = gameState.gameState.piecePostions;
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

    if (localStorage.getItem("color") !== "white") {
      board = [...board].reverse();
    }

    const getPieceAtPosition = (x, y) => {
      const piece = pieces.find((piece) => piece.x === x && piece.y === y);
      return piece ? piece.piece : null;
    };
    return (
      <div className="board-container">
        <div className="grid">
          {board.map((square) => (
            <button
              key={`${square.x},${square.y}`}
              id={`${square.x},${square.y}`}
              className={`${square.color} cell`}
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
    );
  }
}
export default Board;
