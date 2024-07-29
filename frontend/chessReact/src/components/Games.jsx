/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from 'react';



function Games({ handleJoinGame }) {
  const [games, setGames] = useState([]);

  const fetchGames = useCallback(async () => {
    try {
      const gamesData = await getGames();
      setGames(gamesData);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  }, []);

  useEffect(() => {
    console.log('Component mounted');
    // Fetch data once when the component mounts
    fetchGames();

    // Set up an interval to fetch data every 5 seconds
    const intervalId = setInterval(fetchGames, 5000);

    // Clean up the interval when the component unmounts
    return () => {
    
      clearInterval(intervalId);
    };
  }, [fetchGames]);

  useEffect(() => {
  
  }, [games]);

  return (
    <div>
      <h1>Games</h1>
      <ul>
        {games.length > 0 ? (
          games.map((game) => (
            <div className="GameCard" key={game.id}>
              {game.id}
              <button onClick={() => handleJoinGame(game.id)} id={game.id}>
                Join {game.creator}'s Game
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
  const response = await fetch('http://localhost:3000/getGames', {
    method: 'GET',
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`Failed to fetch games: ${errorMessage}`);
  }

  const result = await response.json();
  console.log('Fetched games:', result); // Debug log
  return result;
}
export default Games;