import { useState, useEffect } from "react";

import websocketService from "../services/websocketService";

interface ConnectionStatus {
  isConnected: boolean;
  gameCount: number;
  controllerCount: number;
}

export function useConnectionStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: websocketService.isConnected(),
    gameCount: 0,
    controllerCount: 0,
  });

  useEffect(() => {
    const handleConnection = (data: { connected: boolean }) => {
      setStatus((prev) => ({
        ...prev,
        isConnected: data.connected,
      }));
    };

    const handleStatusUpdate = (data: {
      status: {
        games: number;
        controllers: number;
      };
    }) => {
      setStatus((prev) => ({
        ...prev,
        gameCount: data.status.games,
        controllerCount: data.status.controllers,
      }));
    };

    websocketService.addEventListener("connection", handleConnection);
    websocketService.addEventListener("status_update", handleStatusUpdate);

    return () => {
      websocketService.removeEventListener("connection", handleConnection);
      websocketService.removeEventListener("status_update", handleStatusUpdate);
    };
  }, []);

  return status;
}
