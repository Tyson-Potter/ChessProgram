import React, { useState } from 'react';

const MessengerInput = ({ handleSendMessage }) => {
  const [messageContent, setMessageContent] = useState('');

  const onSendMessage = () => {
    if (messageContent.trim() !== '') {
      handleSendMessage(messageContent);
      setMessageContent(''); // Clear the input box after sending
    }
  };

  return (
    <div className="input-container">
      <input
        type="text"
        value={messageContent}
        onChange={(e) => setMessageContent(e.target.value)}
        placeholder="Type your message here..."
        className="message-input"
      />
      <button onClick={onSendMessage} className="send-button">
        Send
      </button>
    </div>
  );
};

export default MessengerInput;