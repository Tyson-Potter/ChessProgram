import Board from "./components/Board/Board";
import { useState } from "react";
import "./App.css";
import Lobby from "./components/Lobby/Lobby";
import Alert from "./components/Alert/Alert";
function App() {
  const [gameState, setGameState] = useState(false);
  const [playerName, setPlayerName] = useState(false);
  return (
    <>
      {playerName ? (
        <h1>Hello {playerName}</h1>
      ) : (
        <Alert playerName={playerName} setPlayerName={setPlayerName} />
      )}

      {gameState ? (
        <Board gameState={gameState} setGameState={setGameState} />
      ) : (
        <Lobby gameState={gameState} setGameState={setGameState} />
      )}
    </>
  );
}

export default App;
