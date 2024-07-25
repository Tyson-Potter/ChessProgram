import React, { useState, useEffect } from 'react';
import '../assets/board.css';
import blackBishop from '/src/assets/images/black-bishop.png';
import blackKing from '/src/assets/images/black-king.png';
import blackKnight from '/src/assets/images/black-knight.png';
import blackPawn from '/src/assets/images/black-pawn.png';
import blackQueen from '/src/assets/images/black-queen.png';
import blackRook from '/src/assets/images/black-rook.png';
import whiteBishop from '/src/assets/images/white-bishop.png';
import whiteKing from '/src/assets/images/white-king.png';
import whiteKnight from '/src/assets/images/white-knight.png';
import whitePawn from '/src/assets/images/white-pawn.png';
import whiteQueen from '/src/assets/images/white-queen.png';
import whiteRook from '/src/assets/images/white-rook.png';

function Board(gameState) {
    // Create set state variable
   

    // Set gameState to true on component mount
   


   
   
 
    const pieces = [
        { piece: 'whiteRook', x: 0, y: 0, hasMoved: false },
        { piece: 'whiteKnight', x: 1, y: 0 },
        { piece: 'whiteBishop', x: 2, y: 0 },
        { piece: 'whiteQueen', x: 3, y: 0 },
        { piece: 'whiteKing', x: 4, y: 0, hasMoved: false },
        { piece: 'whiteBishop', x: 5, y: 0 },
        { piece: 'whiteKnight', x: 6, y: 0 },
        { piece: 'whiteRook', x: 7, y: 0, hasMoved: false },
        { piece: 'whitePawn', x: 0, y: 1, hasMoved: false },
        { piece: 'whitePawn', x: 1, y: 1, hasMoved: false },
        { piece: 'whitePawn', x: 2, y: 1, hasMoved: false },
        { piece: 'whitePawn', x: 3, y: 1, hasMoved: false },
        { piece: 'whitePawn', x: 4, y: 1, hasMoved: false },
        { piece: 'whitePawn', x: 5, y: 1, hasMoved: false },
        { piece: 'whitePawn', x: 6, y: 1, hasMoved: false },
        { piece: 'whitePawn', x: 7, y: 1, hasMoved: false },
        { piece: 'blackRook', x: 0, y: 7, hasMoved: false },
        { piece: 'blackKnight', x: 1, y: 7 },
        { piece: 'blackBishop', x: 2, y: 7 },
        { piece: 'blackQueen', x: 3, y: 7 },
        { piece: 'blackKing', x: 4, y: 7, hasMoved: false },
        { piece: 'blackBishop', x: 5, y: 7 },
        { piece: 'blackKnight', x: 6, y: 7 },
        { piece: 'blackRook', x: 7, y: 7, hasMoved: false },
        { piece: 'blackPawn', x: 0, y: 6, hasMoved: false },
        { piece: 'blackPawn', x: 1, y: 6, hasMoved: false },
        { piece: 'blackPawn', x: 2, y: 6, hasMoved: false },
        { piece: 'blackPawn', x: 3, y: 6, hasMoved: false },
        { piece: 'blackPawn', x: 4, y: 6, hasMoved: false },
        { piece: 'blackPawn', x: 5, y: 6, hasMoved: false },
        { piece: 'blackPawn', x: 6, y: 6, hasMoved: false },
        { piece: 'blackPawn', x: 7, y: 6, hasMoved: false },
    ];
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
    let board = [
        {"x": 0, "y": 7, "color": "white"},
        {"x": 1, "y": 7, "color": "black"},
        {"x": 2, "y": 7, "color": "white"},
        {"x": 3, "y": 7, "color": "black"},
        {"x": 4, "y": 7, "color": "white"},
        {"x": 5, "y": 7, "color": "black"},
        {"x": 6, "y": 7, "color": "white"},
        {"x": 7, "y": 7, "color": "black"},
        {"x": 0, "y": 6, "color": "black"},
        {"x": 1, "y": 6, "color": "white"},
        {"x": 2, "y": 6, "color": "black"},
        {"x": 3, "y": 6, "color": "white"},
        {"x": 4, "y": 6, "color": "black"},
        {"x": 5, "y": 6, "color": "white"},
        {"x": 6, "y": 6, "color": "black"},
        {"x": 7, "y": 6, "color": "white"},
        {"x": 0, "y": 5, "color": "white"},
        {"x": 1, "y": 5, "color": "black"},
        {"x": 2, "y": 5, "color": "white"},
        {"x": 3, "y": 5, "color": "black"},
        {"x": 4, "y": 5, "color": "white"},
        {"x": 5, "y": 5, "color": "black"},
        {"x": 6, "y": 5, "color": "white"},
        {"x": 7, "y": 5, "color": "black"},
        {"x": 0, "y": 4, "color": "black"},
        {"x": 1, "y": 4, "color": "white"},
        {"x": 2, "y": 4, "color": "black"},
        {"x": 3, "y": 4, "color": "white"},
        {"x": 4, "y": 4, "color": "black"},
        {"x": 5, "y": 4, "color": "white"},
        {"x": 6, "y": 4, "color": "black"},
        {"x": 7, "y": 4, "color": "white"},
        {"x": 0, "y": 3, "color": "white"},
        {"x": 1, "y": 3, "color": "black"},
        {"x": 2, "y": 3, "color": "white"},
        {"x": 3, "y": 3, "color": "black"},
        {"x": 4, "y": 3, "color": "white"},
        {"x": 5, "y": 3, "color": "black"},
        {"x": 6, "y": 3, "color": "white"},
        {"x": 7, "y": 3, "color": "black"},
        {"x": 0, "y": 2, "color": "black"},
        {"x": 1, "y": 2, "color": "white"},
        {"x": 2, "y": 2, "color": "black"},
        {"x": 3, "y": 2, "color": "white"},
        {"x": 4, "y": 2, "color": "black"},
        {"x": 5, "y": 2, "color": "white"},
        {"x": 6, "y": 2, "color": "black"},
        {"x": 7, "y": 2, "color": "white"},
        {"x": 0, "y": 1, "color": "white"},
        {"x": 1, "y": 1, "color": "black"},
        {"x": 2, "y": 1, "color": "white"},
        {"x": 3, "y": 1, "color": "black"},
        {"x": 4, "y": 1, "color": "white"},
        {"x": 5, "y": 1, "color": "black"},
        {"x": 6, "y": 1, "color": "white"},
        {"x": 7, "y": 1, "color": "black"},
        {"x": 0, "y": 0, "color": "black"},
        {"x": 1, "y": 0, "color": "white"},
        {"x": 2, "y": 0, "color": "black"},
        {"x": 3, "y": 0, "color": "white"},
        {"x": 4, "y": 0, "color": "black"},
        {"x": 5, "y": 0, "color": "white"},
        {"x": 6, "y": 0, "color": "black"},
        {"x": 7, "y": 0, "color": "white"}
    ];
    
    localStorage.setItem('color',"white");
if(localStorage.getItem('color')!=="white"){
    board  = board.reverse();
}
    
   

    const getPieceAtPosition = (x, y) => {
        const piece = pieces.find(piece => piece.x === x && piece.y === y);
        return piece ? piece.piece : null;
    };
    return (
        <div className='board-container'>
        <div className="grid">
            {board.map((square) => (
                <button 
                    key={`${square.x},${square.y}`}
                    id={`${square.x},${square.y}`} 
                    className={`${square.color} cell`}
                >{getPieceAtPosition(square.x, square.y) ? <img src={pieceImages[getPieceAtPosition(square.x, square.y)]} alt={getPieceAtPosition(square.x, square.y)} /> : null}</button>
            ))}
        </div>
        </div>
    );
}

export default Board;
