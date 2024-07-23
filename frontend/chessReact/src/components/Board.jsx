import React, { useState, useEffect } from 'react';
import '../assets/board.css';

function Board(gameState) {
    // Create set state variable
   

    // Set gameState to true on component mount
   

    const board = [
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

    return (
        <div className='board-container'>
        <div className="grid">
            {board.map((square) => (
                <button 
                    key={`${square.x},${square.y}`}
                    id={`${square.x},${square.y}`} 
                    className={`${square.color} cell`}
                ></button>
            ))}
        </div>
        </div>
    );
}

export default Board;