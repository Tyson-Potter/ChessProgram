/* eslint-disable react/prop-types */

import { useState } from "react";
import "./alert.css";

const Alert = ({ setPlayerName }) => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() !== "") {
      localStorage.setItem("playerName", inputValue);
      setPlayerName(inputValue);
      setIsModalOpen(false);
    } else {
      alert("Please enter a name");
    }
  };
  return (
    <div>
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Enter Your Name</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter your name"
              />
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alert;
