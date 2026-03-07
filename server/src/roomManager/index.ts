import type { Room } from "../types/index.js";
import { RoomStatus } from "../types/index.js";

export class RoomManager {
    private rooms: Map<string, Room>;

    constructor() {
        this.rooms = new Map();
    }

    createRoom(roomId: string, adminPlayerId: string, adminSocketId: string) {
        const newRoom: Room = {
            roomId,
            adminId: adminPlayerId,
            status: RoomStatus.LOBBY,
            selectedMap: null,
            currentItId: null,
            players: [{
                playerId: adminPlayerId,
                socketId: adminSocketId,
                isAdmin: true,
                x: 0,
                y: 0,
                isIt: false,
                isConnected: true,
            }]
        };
        this.rooms.set(roomId, newRoom);
        return newRoom;
    }

    joinRoom(roomId: string, playerId: string, socketId: string) {
        const room = this.rooms.get(roomId);
        if (!room) {
            throw new Error("Room does not exist");
        }

        //checking if the player was already in the room before
        const playerExists = room.players.find(p => p.playerId === playerId);

        if (room.status === RoomStatus.CLOSED) {
            throw new Error("Room is already closed")
        }

        else if (room.status === RoomStatus.PLAYING) {
            if (!playerExists) {
                throw new Error("Game has already started. Cannot join room")
            }
            else {
                playerExists.socketId = socketId;
                playerExists.isConnected = true;
                playerExists.isAdmin = room.adminId === playerId;
            }
        }

        else if (room.status === RoomStatus.LOBBY) {
            if (!playerExists) {
                room.players.push({
                    playerId,
                    socketId,
                    isAdmin: room.adminId === playerId,
                    x: 0,
                    y: 0,
                    isIt: false,
                    isConnected: true,
                });
            }
            else {
                playerExists.socketId = socketId;
                playerExists.isConnected = true;
                playerExists.isAdmin = room.adminId === playerId;
            }
        }
        return room;
    }

    exitRoom(roomId: string, socketId: string, playerId: string) {
        const room = this.rooms.get(roomId);
        if (!room) {
            throw new Error("Room does not exist")
        }

        if (room.status === RoomStatus.CLOSED) {
            return {
                msg: "Room is already closed"
            }
        }

        if (room.status === RoomStatus.LOBBY) {
            room.players = room.players.filter(p => p.socketId !== socketId);
            if (room.players.length === 0) {
                this.rooms.delete(roomId);
            } else if (room.adminId === playerId) {
                const nextAdmin = room.players.find(p => p.socketId && p.isConnected);
                if (nextAdmin) {
                    nextAdmin.isAdmin = true;
                    room.adminId = nextAdmin.playerId;
                }
            }
        }

        else if (room.status === RoomStatus.PLAYING) {
            room.players = room.players.filter(p => p.socketId !== socketId);
            if (room.players.length === 0) {
                this.rooms.delete(roomId);
                return;
            }
            if (room.adminId === playerId) {
                const nextAdmin = room.players.find(p => p.isConnected && p.socketId);
                if (nextAdmin) {
                    room.adminId = nextAdmin.playerId
                    nextAdmin.isAdmin = true;
                }
            }
        }
        return room;
    }

    handleDisconnect(roomId: string, socketId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return null;

        const player = room.players.find(p => p.socketId === socketId);
        if (!player) return room;

        if (room.status === RoomStatus.LOBBY) {
            room.players = room.players.filter(p => p.socketId !== socketId);

            // Handle Admin Succession in Lobby
            if (room.adminId === player.playerId && room.players.length > 0) {
                const nextAdmin = room.players.find(p => p.socketId && p.isConnected);
                if (nextAdmin) {
                    nextAdmin.isAdmin = true;
                    room.adminId = nextAdmin.playerId;
                }
            }
        }
        else if (room.status === RoomStatus.PLAYING) {
            player.isConnected = false;
            player.socketId = "";

            if (room.adminId === player.playerId) {
                const activePlayer = room.players.find(p => p.isConnected);
                if (activePlayer) {
                    room.adminId = activePlayer.playerId;
                    activePlayer.isAdmin = true;
                }
            }
        }

        // if no one is connected any more kill the room
        const anyConnected = room.players.some(p => p.isConnected);
        if (!anyConnected && room.players.length > 0) {
            this.rooms.delete(roomId)
        }

        return room;
    }

    updatePosition(roomId: string, socketId: string, x: number, y: number) {
        const room = this.rooms.get(roomId);
        const player = room?.players.find(p => p.socketId === socketId);
        if (player) {
            player.x = x;
            player.y = y;
        }
        return player;
    }

    getRoom(roomId: string): Room | undefined {
        return this.rooms.get(roomId);
    }
}

export const roomManager = new RoomManager();