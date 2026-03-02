import express from 'express';
import cors from 'cors'
import { createServer } from 'http';
import { Server } from "socket.io";
import { roomManager } from './roomManager/index.js';
import { room } from './routes/room.js';
import { user } from './routes/user.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/room', room);
app.use('/api/user', user);

const roomTimers = new Map();
const roomEndTimes = new Map();

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
    }
})

io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    socket.on("joinRoom", ({ roomId, playerId }) => {
        try {
            // console.log(`Player ${playerId} is attempting to join room ${roomId}`); 
            const isRoomExists = roomManager.getRoom(roomId);
            if (!isRoomExists) {
                socket.emit("error", { error: "Room does not exist" });
                return;
            }
            roomManager.joinRoom(roomId, playerId, socket.id);
            socket.join(roomId);
            const roomDetails = roomManager.getRoom(roomId);
            io.to(roomId).emit("update-players", roomDetails);
        }
        catch (error) {
            console.error("Error joining room:", error);
            socket.emit("error", { error: "An error occurred while joining the room" });
        }
    })

    socket.on("exitRoom", ({ roomId, playerId }) => {
        try {
            const isRoomExists = roomManager.getRoom(roomId);
            if (!isRoomExists) {
                socket.emit("error", { error: "Room does not exist" });
                return;
            }
            roomManager.exitRoom(roomId, playerId, socket.id);
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
        const updated = roomManager.updatePosition(roomId, socket.id, x, y);
        if (updated) {
            socket.to(roomId).emit("player-moved", { socketId: socket.id, x, y });
        }
    })

    socket.on("start-game", ({ roomId }) => {
        try {
            if (roomTimers.has(roomId)) return;

            const players = roomManager.getRoom(roomId);
            if (!players) {
                socket.emit("error", { error: "Room does not exist" });
                return;
            }
            const sender = players.find(p => p.socketId === socket.id);
            if (!sender?.admin) {
                socket.emit("error", { error: "Only the host can start the game" });
                return;
            }
            const timeLeft = 120_000;
            const endTime = timeLeft + Date.now();
            io.to(roomId).emit("game-start", { roomId, endTime });

            const timeoutId = setTimeout(() => {
                const currentPlayers = roomManager.getRoom(roomId);
                if (currentPlayers) {
                    const loser = currentPlayers.find(p => p.isIt);
                    io.to(roomId).emit("game-over", { loserName: loser?.playerId || "Unknown" });
                    roomTimers.delete(roomId);
                    roomEndTimes.delete(roomId);
                }
            }, timeLeft);

            roomTimers.set(roomId, timeoutId);
            roomEndTimes.set(roomId, endTime);

            // Assign a random player as "it"
            const randomIndex = Math.floor(Math.random() * players.length);
            for (let i = 0; i < players.length; i++) {
                players[i]!.isIt = (i === randomIndex);
            }
            const itSocketId = players[randomIndex]!.socketId;
            io.to(roomId).emit("tag-update", { itSocketId });

            console.log(`Game started in room ${roomId} by ${sender.playerId}. ${itSocketId} is "it". End time: ${endTime}`);
        } catch (error) {
            console.error("Error starting game:", error);
            socket.emit("error", { error: "An error occurred while starting the game" });
        }
    })

    socket.on("request-tag-status", ({ roomId }) => {
        const players = roomManager.getRoom(roomId);
        if (!players) return;
        const itPlayer = players.find(p => p.isIt);
        if (itPlayer) {
            socket.emit("tag-update", { itSocketId: itPlayer.socketId });
        }
    })

    socket.on("tag", ({ roomId, taggedSocketId }) => {
        try {
            const players = roomManager.getRoom(roomId);
            if (!players) return;

            // Verify the sender is actually "it"
            const tagger = players.find(p => p.socketId === socket.id);
            if (!tagger?.isIt) return;

            // Verify the tagged player exists in the room
            const tagged = players.find(p => p.socketId === taggedSocketId);
            if (!tagged) return;

            // Transfer "it" status
            for (const p of players) {
                p.isIt = (p.socketId === taggedSocketId);
            }

            // Broadcast to everyone in the room
            io.to(roomId).emit("tag-update", { itSocketId: taggedSocketId });
            console.log(`[Tag] ${socket.id} tagged ${taggedSocketId} in room ${roomId}`);
        } catch (error) {
            console.error("Error handling tag:", error);
        }
    })

    socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id);
        try {
            const allRooms = roomManager.getRooms();
            allRooms.forEach((players, roomId) => {
                const playerIndex = players.findIndex(p => p.socketId === socket.id);

                if (playerIndex !== -1) {
                    const playerId = players[playerIndex]?.playerId;
                    if (!playerId) {
                        console.warn(`Player with socket ID ${socket.id} has no associated playerId. Skipping cleanup.`);
                        return;
                    }
                    console.log(`Auto-removing player ${playerId} from room ${roomId}`);
                    roomManager.exitRoom(roomId, playerId, socket.id);
                    const updatedRoomDetails = roomManager.getRoom(roomId);
                    if (updatedRoomDetails) {
                        io.to(roomId).emit("update-players", updatedRoomDetails);
                    }
                }
            });
        } catch (error) {
            console.error("Error during disconnect cleanup:", error);
        }
    });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));