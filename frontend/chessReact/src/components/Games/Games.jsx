/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from "react";

function Games({ handleJoinGame }) {
  const [games, setGames] = useState([]);

  const fetchGames = useCallback(async () => {
    try {
      const gamesData = await getGames();
      setGames(gamesData);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  }, []);

  useEffect(() => {
    fetchGames();

    const intervalId = setInterval(fetchGames, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchGames]);

  useEffect(() => {}, [games]);

  return (
    <div>
      <h1>Games</h1>
      <ul>
        {games.length > 0 ? (
          games.map((game) => (
            <div className="GameCard" key={game._id}>
              {game._id}
              <button
                key={game.id}
                onClick={() => handleJoinGame(game._id)}
                id={game._id}
              >
                Join {game.creator}&apos;s Game
              </button>
            </div>
          ))
        ) : (
          <p>No games available</p>
        )}
      </ul>
    </div>
  );
}
async function getGames() {
  const response = await fetch("http://localhost:3000/getGames", {
    method: "GET",
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`Failed to fetch games: ${errorMessage}`);
  }

  const result = await response.json();

  return result;
}
export default Games;
