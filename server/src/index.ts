import express from 'express';
import cors from 'cors'
import { createServer } from 'http';
import { Server } from "socket.io";
import { roomManager } from './roomManager/index.js';
import { room } from './routes/room.js';
import { user } from './routes/user.js';
import dotenv from 'dotenv';
import { RoomStatus } from './types/index.js';
import type { JoinRoomType } from './types/index.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/room', room);
app.use('/api/user', user);

const roomTimers = new Map();
const playerLastUpdate = new Map();

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
    }
})

const handleGameOver = (roomId: string) => {
    try {
        const room = roomManager.getRoom(roomId);

        if (!room) {
            console.log(`[Game Over] Room ${roomId} no longer exists.`);
            return;
        }
        const loser = room.players.find(p => p.isIt);

        const gameOverData = {
            loserId: loser ? loser.playerId : null,
            roomStats: {
                totalPlayers: room.players.length,
                duration: "2:00"
            }
        };

        console.log(gameOverData)

        io.to(roomId).emit("game-over", { gameOverData: gameOverData });

        room.status = RoomStatus.LOBBY;
        room.endTime = undefined;
        room.currentItId = null;

        room.players.forEach(p => {
            p.isIt = false;
            p.isReady = false;
        });

        roomTimers.delete(roomId);

        io.to(roomId).emit("update-players", room);

        console.log(`[Game Over] Room ${roomId} finished. Loser: ${gameOverData.loserId}`);
    } catch (error) {
        console.error(`Error in handleGameOver for room ${roomId}:`, error);
    }
};

io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);
    const socketUpdateKey = `${socket.id}-updateTime`;
    playerLastUpdate.set(socketUpdateKey, 0);
    socket.currentRoom = null;

    socket.on("joinRoom", ({ roomId, playerId }: JoinRoomType) => {
        try {
            const room = roomManager.joinRoom(roomId, playerId, socket.id)
            socket.join(roomId);
            socket.currentRoom = roomId;

            const roomDetails = roomManager.getRoom(roomId);
            io.to(roomId).emit("update-players", roomDetails);

            if (room.status === RoomStatus.PLAYING && room.endTime) {
                socket.emit("game-start", {
                    roomId,
                    endTime: room.endTime
                })
                if (room.currentItId) {
                    const itPlayer = room.players.find(p => p.playerId === room.currentItId);
                    if (itPlayer) {
                        socket.emit("tag-update", { itSocketId: itPlayer.socketId });
                    }
                }
            }
        }
        catch (error: any) {
            console.error("Error joining room:", error);
            socket.emit("error", { error: error.message });
        }
    })

    socket.on("exitRoom", ({ roomId, playerId }) => {
        try {
            const isRoomExists = roomManager.getRoom(roomId);
            if (!isRoomExists) {
                socket.emit("error", { error: "Room does not exist" });
                return;
            }
            roomManager.exitRoom(roomId, socket.id, playerId);
            socket.leave(roomId);
            const roomDetails = roomManager.getRoom(roomId);
            io.to(roomId).emit("update-players", roomDetails);
        }
        catch (error) {
            console.error("Error exiting room:", error);
            socket.emit("error", { error: "An error occurred while exiting the room" });
        }
    })

    socket.on("updatePosition", ({ roomId, x, y }) => {
        const now = Date.now();
        const socketUpdateKey = `${socket.id}-updateTime`;
        const lastUpdate = playerLastUpdate.get(socketUpdateKey) || 0;

        // Rate limit: only allow updates every 50ms (20 updates/second)
        if (now - lastUpdate < 50) return;

        const updated = roomManager.updatePosition(roomId, socket.id, x, y);
        if (updated) {
            playerLastUpdate.set(socketUpdateKey, now);
            socket.to(roomId).emit("player-moved", { socketId: socket.id, x, y });
        }
    })

    socket.on("start-game", ({ roomId, playerId }) => {
        try {
            const room = roomManager.getRoom(roomId);
            if (!room) {
                socket.emit("error", { error: "Room does not exist" });
                return;
            }

            if (playerId !== room?.adminId) {
                socket.emit("error", { error: "Only admin can start the game" });
                return;
            }
            room.status = RoomStatus.PLAYING;
            room.endTime = Date.now() + 10_000;

            const nonReadyPlayers = room.players.filter(p => !p.isReady);
            room.players = room.players.filter(p => p.isReady);

            nonReadyPlayers.forEach(p => {
                if (p.socketId) {
                    const clientSocket = io.sockets.sockets.get(p.socketId);
                    if (clientSocket) {
                        clientSocket.leave(roomId);
                    }
                }
            });

            const players = room.players;

            const timer = setTimeout(() => {
                handleGameOver(roomId)
            }, 10_000)

            roomTimers.set(roomId, timer)
            let itSocketId = null;
            if (players) {
                const randomIndex = Math.floor(Math.random() * players.length);
                for (let i = 0; i < players.length; i++) {
                    players[i]!.isIt = (i === randomIndex);
                }
                itSocketId = players[randomIndex]!.socketId;
                io.to(roomId).emit("tag-update", { itSocketId });
            }
            console.log(`Game started in room ${roomId} by ${room.adminId}. ${itSocketId} is "it".`);
            io.to(roomId).emit("update-players", room);
            io.to(roomId).emit("game-start", { roomId, endTime: room.endTime });
            return;
        } catch (error) {
            console.error("Error starting game:", error);
            socket.emit("error", { error: "An error occurred while starting the game" });
        }
    })

    socket.on("request-tag-status", ({ roomId }) => {
        const room = roomManager.getRoom(roomId);
        if (!room) {
            socket.emit("error", { error: "Room does not exist" });
        }
        const itPlayer = room?.players.find(p => p.isIt)
        if (itPlayer) {
            socket.emit("tag-update", { itSocketId: itPlayer.socketId });
        }
    })

    socket.on("request-room-state", ({ roomId }) => {
        const room = roomManager.getRoom(roomId);
        if (room) {
            socket.emit("update-players", room);
        }
    })

    socket.on("tag", ({ roomId, taggedSocketId }) => {
        try {
            const room = roomManager.getRoom(roomId);
            if (!room) {
                socket.emit("error", { error: "Room does not exist" });
                return;
            }
            if (room?.players.length === 0) {
                socket.emit("error", { error: "No players in the room" });
                return;
            }
            const tagger = room.players.find(p => p.socketId === socket.id);
            if (!tagger?.isIt) return;

            const tagged = room.players.find(p => p.socketId === taggedSocketId);
            if (!tagged) return;

            for (const p of room.players) {
                p.isIt = (p.socketId === taggedSocketId);
            }

            io.to(roomId).emit("tag-update", { itSocketId: taggedSocketId });
            console.log(`[Tag] ${socket.id} tagged ${taggedSocketId} in room ${roomId}`);
        } catch (error) {
            console.error("Error handling tag:", error);
        }
    })

    socket.on("disconnect", () => {
        const roomId = socket.currentRoom;
        if (!roomId) return;

        const updatedRoom = roomManager.handleDisconnect(roomId, socket.id);

        if (updatedRoom) {
            io.to(roomId).emit("update-players", updatedRoom);
        } else {
            roomTimers.delete(roomId);
        }
    });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));