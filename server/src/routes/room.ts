import express from 'express';
import type { Request, Response, Router } from 'express';
import { roomManager } from '../roomManager/index.js';

export const room: Router = express.Router();

room.post('/create', (req: Request, res: Response) => {
    try {
        const playerId = req.body.playerId as string;
        if (!playerId) {
            return res.status(400).json({ error: "playerId is required" });
        }
        const newRoomId = Math.random().toString(36).substring(2, 9);
        roomManager.createRoom(newRoomId, playerId);
        res.json({ roomId: newRoomId });
    }
    catch (error) {
        return res.status(500).json({ error: "An error occurred while creating the room" });
    }
})

room.get("/:roomId", (req: Request, res: Response) => {
    try {
        const roomId = req.params.roomId as string;
        if (roomId == null || roomId == undefined || roomId.trim() === "") {
            return res.status(400).json({ error: "Invalid room ID" });
        }
        const roomDetails = roomManager.getRoom(roomId);
        if (!roomDetails) {
            return res.status(404).json({ error: "Room does not exist" });
        }
        res.json(roomDetails);
    }
    catch (error) {
        return res.status(500).json({ error: "An error occurred while fetching the room details" });
    }
})

room.post("/join/:roomId", (req: Request, res: Response) => {
    try {
        const roomId = req.params.roomId as string;
        const playerId = req.body.playerId as string;
        if (!playerId) {
            return res.status(400).json({ error: "playerId is required" });
        }
        if (roomId == null || roomId == undefined || roomId.trim() === "") {
            return res.status(400).json({ error: "Invalid room ID" });
        }
        const roomDetails = roomManager.getRoom(roomId);
        if (!roomDetails) {
            return res.status(404).json({ error: "Room does not exist" });
        }
        roomManager.joinRoom(roomId, playerId)
        const updatedRoomDetails = roomManager.getRoom(roomId);
        res.json(updatedRoomDetails);
    }
    catch (error) {
        return res.status(500).json({ error: "An error occurred while joining the room" });
    }
})

room.post("/exit/:roomId", (req: Request, res: Response) => {
    try {
        const roomId = req.params.roomId as string;
        const playerId = req.body.playerId as string;
        if (!playerId) {
            return res.status(400).json({ error: "playerId is required" });
        }
        if (roomId == null || roomId == undefined || roomId.trim() === "") {
            return res.status(400).json({ error: "Invalid room ID" });
        }
        const roomDetails = roomManager.getRoom(roomId);
        if (!roomDetails) {
            return res.status(404).json({ error: "Room does not exist" });
        }
        roomManager.exitRoom(roomId, playerId)
        res.json(roomDetails);
    }
    catch (error) {
        return res.status(500).json({ error: "An error occurred while exiting the room" });
    }
})