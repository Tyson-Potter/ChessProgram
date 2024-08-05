/* eslint-disable react/prop-types */

import Games from "../Games/Games";

function Lobby({ setGameState, gameState }) {

  async function handleCreateGame(setGameState) {
    let response = await createGame();
   
    localStorage.setItem("gameId", response.game._id);
    localStorage.setItem("color", "white");
    setGameState(response.game);
    
  }
  async function handleJoinGame(gameId) {
    let response = await joinGame(gameId);
    localStorage.setItem("gameId", response._id);
    localStorage.setItem("color", "black");
    console.log(response._id);
    setGameState(response);
  }
  return (
    <>
      <button
        key="button"
        onClick={() => handleCreateGame(setGameState, gameState)}
        id="createGame"
      >
        Create Game
      </button>
      Create Game
      <Games setGameState ={setGameState}handleJoinGame={handleJoinGame} />
    </>
  );
}
async function createGame() {
  const response = await fetch("http://localhost:3000/createGame", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      creator: localStorage.getItem("playerName"),
    }),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`Failed to create game: ${errorMessage}`);
  }

  const result = await response.json();

  return result;
}

//Todo
// async function makeMove()

async function joinGame(gameId) {
  
  const response = await fetch("http://localhost:3000/joinGame", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: gameId,
    }),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`Failed to create game: ${errorMessage}`);
  }

  const result = await response.json();

  return result;
}
export default Lobby;
