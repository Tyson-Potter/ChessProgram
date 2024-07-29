import Board from './components/Board';
import { useState } from 'react';
import './App.css'
import Lobby from './components/Lobby';
function App() {

const [gameState, setGameState] = useState(false);

  return (
    <>

      {gameState ? (
        <Board gameState={gameState}/>
      ) : (
   <Lobby/>
      )}
    </>
  );
}



export default App
