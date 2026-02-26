import { useEffect, useState, useCallback, useRef } from "react";
import { socketManager } from "@/socket/socketManager";

export function useRoom(roomId, playerId) {
    const [players, setPlayers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);

    const roomIdRef = useRef(roomId);
    const playerIdRef = useRef(playerId);
    roomIdRef.current = roomId;
    playerIdRef.current = playerId;


    const handleUpdatePlayers = useCallback((roomDetails) => {
        if (Array.isArray(roomDetails)) {
            setPlayers(roomDetails);
        }
    }, []);

    const handleError = useCallback((payload) => {
        setError(payload?.error ?? "An unknown error occurred");
    }, []);

    const handleGameStart = useCallback(() => {
        setGameStarted(true);
    }, []);


    useEffect(() => {
        if (!roomId || !playerId) return;

        socketManager.connect();

        const onConnect = () => {
            setIsConnected(true);
            socketManager.joinRoom(roomIdRef.current, playerIdRef.current);
        };

        if (socketManager.isConnected) {
            onConnect();
        } else {
            socketManager.on("connect", onConnect);
        }

        socketManager.on("update-players", handleUpdatePlayers);
        socketManager.on("error", handleError);
        socketManager.on("game-start", handleGameStart);

        socketManager.on("disconnect", () => setIsConnected(false));

        return () => {
            socketManager.exitRoom(roomIdRef.current, playerIdRef.current);
            socketManager.off("connect", onConnect);
            socketManager.off("update-players", handleUpdatePlayers);
            socketManager.off("error", handleError);
            socketManager.off("game-start", handleGameStart);
            socketManager.disconnect();
        };
    }, [roomId, playerId]);

    const currentPlayer = players.find((p) => p.playerId === playerId);
    const isAdmin = currentPlayer?.admin ?? false;

    const startGame = useCallback(() => {
        socketManager.emit("start-game", { roomId: roomIdRef.current });
        setGameStarted(true);
    }, []);

    const leaveRoom = useCallback(() => {
        socketManager.exitRoom(roomIdRef.current, playerIdRef.current);
        socketManager.disconnect();
    }, []);

    return {
        players,
        isConnected,
        isAdmin,
        error,
        gameStarted,
        startGame,
        leaveRoom,
    };
}
