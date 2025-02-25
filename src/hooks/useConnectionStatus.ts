import { useState, useEffect } from "react";

export const useConnectionStatus = (connectDelay = 1500) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connectTimeout = setTimeout(() => {
      setIsConnected(true);
    }, connectDelay);

    return () => clearTimeout(connectTimeout);
  }, [connectDelay]);

  return { isConnected };
};
