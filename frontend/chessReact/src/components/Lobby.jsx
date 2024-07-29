
import Games from './Games';

function Lobby({setGameState, gameState, joinGame }) {
  async function handleCreateGame(setGameState) {
//TODO
  }
  async function handleJoinGame(gameId) {
    let response = await joinGame(gameId);
    localStorage.setItem("playerName", "Black");
    localStorage.setItem("currentGameId", response.game.id);
    //Set Game State
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
      <Games handleJoinGame={handleJoinGame} />
    </>
  );
}
async function createGame() {
  const response = await fetch("http://localhost:3000/createGame", {
    method: "PUT",
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`Failed to create game: ${errorMessage}`);
  }

  const result = await response.json();

  return result;
}
async function makeMove(gameId, [x, y]) {
  const response = await fetch(`http://localhost:3001/makeMove`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      gameId: gameId,
      playerName: localStorage.getItem("playerName"),
      x: x,
      y: y,
    }),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`Failed to join game: ${errorMessage}`);
  }

  const result = await response.json();

  return result;
}
async function deleteGame(gameId) {
  // eslint-disable-next-line no-unused-vars
  const response = await fetch(`http://localhost:3001/deleteGame`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      gameId: gameId,
    }),
  });
}

export default Lobby;
