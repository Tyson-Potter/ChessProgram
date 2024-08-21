
import React, { useState, useEffect } from 'react';

const Message = ({ owner, content }) => {
  const [decryptedContent, setDecryptedContent] = useState('Decrypting...');

  useEffect(() => {
    const key = localStorage.getItem('key');
    if (!key) {
      console.error("No key found in localStorage.");
      setDecryptedContent("No decryption key found");
    } else {
      decryptMessageBase64(key, content)
        .then(decryptedMessage => setDecryptedContent(decryptedMessage))
        .catch(error => {
          console.error("Decryption failed:", error);
          setDecryptedContent("Failed to decrypt");
        });
    }
  }, [content]); 

  return (
    <div className="message">
      <span>
        <strong>{owner}:</strong> {decryptedContent}
      </span>
    </div>
  );
};

async function decryptMessageBase64(sharedKeyBase64, encryptedMessageBase64) {
  try {
    const keyBytes = Uint8Array.from(atob(sharedKeyBase64), c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["decrypt"]);
    const encryptedData = Uint8Array.from(atob(encryptedMessageBase64), c => c.charCodeAt(0));
    const iv = encryptedData.slice(0, 12);
    const ciphertext = encryptedData.slice(12);
    const decryptedBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, ciphertext);
    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt message");
  }
}

export default Message;
