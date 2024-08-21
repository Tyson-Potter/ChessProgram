import Board from "./components/Board/Board";
import { useState,useEffect } from "react";
import "./App.css";
import Lobby from "./components/Lobby/Lobby";
import Alert from "./components/Alert/Alert";
import Messenger from "./components/Messenger/Messenger"
function App() {
  const [gameState, setGameState] = useState(false);
 
  const [playerName, setPlayerName] = useState(
    localStorage.getItem("playerName")
  );

 

  let gameId = localStorage.getItem("gameId");
  useEffect(() => {
    if (!gameId) {
      console.log("No gameId found. Skipping API call.");
      return;
    }

    const fetchGameState = async () => {
      try {
        const gamesData = await getCurrentGameState(gameId);
        setGameState(gamesData);
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    };

    // Fetch game state immediately
    fetchGameState();

    // Set interval to fetch game state every 5 seconds
    const intervalId = setInterval(fetchGameState, 2000);

    // Clear the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  return (
    <>
      {playerName ? (
        <h1>Hello {playerName}</h1>
      ) : (
        <Alert playerName={playerName} setPlayerName={setPlayerName} />
      )}

      {gameState ? (
         <><Messenger gameState={gameState} playerName={playerName} />
           <Board gameState={gameState} setGameState={setGameState} />
           </>
      
        
      ) : (
        <Lobby gameState={gameState} setGameState={setGameState} />
      )}
    </>
  );
}
async function getCurrentGameState() {
  const response = await fetch("http://localhost:3000/getGameState", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      gameId: localStorage.getItem("gameId"),
      playerColor: localStorage.getItem("color"),
    }),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`Failed to fetch game state: ${errorMessage}`);
  }

  try {
    const result = await response.json();
    return result;
  } catch (error) {
    throw new Error("Failed to parse JSON response");
  }
}

export default App;
