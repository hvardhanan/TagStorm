import { io } from "socket.io-client";
import { SERVER_URL } from "../config/config";

class SocketManager {
    constructor() {
        this.socket = null;
    }

    connect() {
        if (this.socket?.connected) return this.socket;

        this.socket = io(SERVER_URL, {
            transports: ["websocket"],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on("connect", () => {
            console.log("[SocketManager] connected:", this.socket.id);
        });

        this.socket.on("disconnect", (reason) => {
            console.log("[SocketManager] disconnected:", reason);
        });

        this.socket.on("connect_error", (err) => {
            console.error("[SocketManager] connection error:", err.message);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
    }

    get isConnected() {
        return !!this.socket?.connected;
    }

    get id() {
        return this.socket?.id ?? null;
    }

    on(event, handler) {
        this.socket?.on(event, handler);
        return this;
    }

    off(event, handler) {
        if (handler) {
            this.socket?.off(event, handler);
        } else {
            this.socket?.removeAllListeners(event);
        }
        return this;
    }

    emit(event, data) {
        this.socket?.emit(event, data);
        return this;
    }

    joinRoom(roomId, playerId) {
        this.emit("joinRoom", { roomId, playerId });
    }

    exitRoom(roomId, playerId) {
        this.emit("exitRoom", { roomId, playerId });
    }

    updatePosition(roomId, x, y) {
        this.emit("updatePosition", { roomId, x, y });
    }
}

export const socketManager = new SocketManager();
