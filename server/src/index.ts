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

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
    }
})

io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    socket.on("joinRoom", ({ roomId, playerId}) => {
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

    socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id);
        try {
            const allRooms = roomManager.getRooms();
            allRooms.forEach((players, roomId) => {
                const playerIndex = players.findIndex(p => p.socketId === socket.id);
                
                if (playerIndex !== -1) {
                    const playerId = players[playerIndex]?.playerId;
                    if(!playerId) {
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