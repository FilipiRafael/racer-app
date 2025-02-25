type Listener = (data: any) => void;
type Direction = "up" | "down" | "left" | "right" | null;

const SERVER_URL = "ws://192.168.18.177:8080";

class WebSocketService {
  private socket: WebSocket | null = null;
  private connected = false;
  private listeners: Map<string, Listener[]> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private clientId: string | null = null;

  constructor() {
    this.connect();
  }

  connect(): void {
    if (this.socket) {
      this.socket.close();
    }

    this.socket = new WebSocket(SERVER_URL);

    this.socket.onopen = this.handleOpen.bind(this);
    this.socket.onmessage = this.handleMessage.bind(this);
    this.socket.onerror = this.handleError.bind(this);
    this.socket.onclose = this.handleClose.bind(this);
  }

  private handleOpen(): void {
    console.log("WebSocket connection established");
    this.connected = true;
    this.send({
      type: "IDENTIFY",
      clientType: "controller",
    });
    this.notify("connection", { connected: true });
  }

  private handleMessage(event: WebSocketMessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);

      if (data.type === "CONNECTED") {
        this.clientId = data.clientId;
      }

      this.notify("message", data);

      if (data.type) {
        this.notify(data.type.toLowerCase(), data);
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  }

  private handleError(event: Event): void {
    console.error("WebSocket error:", event);
    this.notify("error", event);
  }

  private handleClose(event: WebSocketCloseEvent): void {
    console.log("WebSocket connection closed:", event.code, event.reason);
    this.connected = false;
    this.notify("connection", { connected: false });

    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      console.log("Attempting to reconnect...");
      this.connect();
    }, 3000);
  }

  send(data: any): void {
    if (this.connected && this.socket) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn("Cannot send message, not connected");
    }
  }

  sendJoystickUpdate(directions: Direction[]): void {
    this.send({
      type: "JOYSTICK_UPDATE",
      directions,
      timestamp: Date.now(),
    });
  }

  isConnected(): boolean {
    return this.connected;
  }

  addEventListener(event: string, callback: Listener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event)?.push(callback);
  }

  removeEventListener(event: string, callback: Listener): void {
    if (!this.listeners.has(event)) return;

    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private notify(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.connected = false;
  }
}

export default new WebSocketService();
