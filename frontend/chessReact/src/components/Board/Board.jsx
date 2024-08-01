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
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [selectedSquare, setSelectedSquare] = useState(null);
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
   
const handleClick = (square) => {
  // if not current players turn do nothing
  if(gameState.gameState.currentTurn != localStorage.getItem("color")){

   console.log("Not your turn");
  }else{
    //Check if Clicked square has a pieace on it 
    const clickedPiece = pieces.find(obj => obj.x === square.x && obj.y === square.y);
    if(clickedPiece){
      
      //Check if they clicked thier piece or an enempy piece
      if(clickedPiece.color===localStorage.getItem("color")){
        console.log("clicked thier Piece")
        //add css stuff to change what selected square looks like border or somthing
        setSelectedPiece(clickedPiece);
       setSelectedSquare(null);
      
      }else{
        console.log("clicked enemy Piece")
        //clicked an ememy Piece
        if(selectedPiece!=null){
          console.log("Make Move attack");
          //sent api request to make a move
              //reset selected Pieace and selected square
        }else{
          //Do Nothing
        }
      }

     
    }else{
      //clicked an empty square
      if(selectedPiece!=null){
        console.log("Make Move");
        
        //sent api request to make a move
        //reset selected Pieace and selected square
      }else{
        //Do Nothing
      }
      
    }

  }
};
    

    if (localStorage.getItem("color") !== "white") {
      board = [...board].reverse();
    }

    const getPieceAtPosition = (x, y) => {
      const piece = pieces.find((piece) => piece.x === x && piece.y === y);
      return piece ? piece.piece : null;
    };
    return (
      <>
      <h1>You Are {localStorage.getItem("color") }</h1>
      <div className="board-container">
        <div className="grid">
          {board.map((square) => (
            <button  onClick={() => handleClick(square)}
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
      </>
    );
  }
}
export default Board;
