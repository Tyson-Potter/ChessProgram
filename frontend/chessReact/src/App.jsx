import Board from './components/Board';
import { useState } from 'react';
import './App.css'

function App() {
//create set state variable
const [gameState, setGameState] = useState(true);



  return (
    <>

      {gameState ? (
        <Board gameState={gameState}/>
      ) : (
   null
      )}
    </>
  );
}



export default App
