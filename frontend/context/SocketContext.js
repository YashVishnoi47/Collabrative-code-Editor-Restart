"use client";
import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    // const newSocket = io("http://localhost:4000");
    const newSocket = io("https://collabrative-code-editor-3yy1.onrender.com",{
      transports: ['websocket'],
    });
    newSocket.on("connect", () => {
      setSocket(newSocket);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {socket ? children : <p>Loading socket...</p>}{" "}
    </SocketContext.Provider>
  );
}
