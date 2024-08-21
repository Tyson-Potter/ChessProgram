/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import "./Messenger.css";
import MessengerInput from "./MessengerInput";
import Message from "./Message";

const Messenger = ({ gameState,playerName }) => {
  const [myKey, setMyKey] = useState(false);
  if(myKey===false){
    localStorage.setItem("key",gameState.key);
    setMyKey(gameState.key);
  }
  
 
  const handleSendMessage = (content) => {
   console.log("Sending Message");
    sendMessage(playerName,content,localStorage.getItem("gameId"))
  };
  let messages=gameState.chat.messages;
 
  return (
    <div className="messageComponentContainer">
      <h1>{localStorage.getItem("key")}</h1>
    
      <div className="Chat-Container">
     
        {messages.map((message, index) => (
          
          <Message key={index} owner={message.owner} content={message.content} />
          
        ))}
      </div>
      <MessengerInput handleSendMessage={handleSendMessage} />
    </div>
  );
};


async function sendMessage(playerName,content,gameId) {
  let messageContent =await encryptMessage(localStorage.getItem("key"),content);
  const response = await fetch("http://localhost:3000/sendMessage", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      playerName:playerName,
      messageContent:messageContent,
      gameId
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
async function encryptMessage(sharedKeyBase64, message) {
  // Import the shared key from Base64 format
  const key = await crypto.subtle.importKey(
    "raw",
    Uint8Array.from(atob(sharedKeyBase64), c => c.charCodeAt(0)),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  // Convert the message to a byte array
  const encodedMessage = new TextEncoder().encode(message);

  // Generate a random initialization vector (IV)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the message
  const encryptedMessage = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedMessage
  );

  // Combine IV and encrypted message for transmission
  const combined = new Uint8Array(iv.length + encryptedMessage.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedMessage), iv.length);

  // Convert to Base64 for easy transport
  return btoa(String.fromCharCode(...combined));
}


export default Messenger;
