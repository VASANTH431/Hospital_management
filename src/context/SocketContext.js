import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to Backend Socket.IO Server
    const socketInstance = io(process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'https://hospital-management-3-4uml.onrender.com');
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket server:', socketInstance.id);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
