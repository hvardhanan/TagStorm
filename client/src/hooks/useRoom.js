import { useEffect, useState, useCallback, useRef } from "react";
import { socketManager } from "@/socket/socketManager";

const roomStateCache = {};

export function useRoom(roomId, playerId) {
    const [players, setPlayers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [gameStarted, setGameStarted] = useState(
        () => roomStateCache[roomId]?.gameStarted ?? false
    );
    const [endTime, setEndTime] = useState(
        () => roomStateCache[roomId]?.endTime ?? null
    );
    const [loser, setLoser] = useState(null);

    const roomIdRef = useRef(roomId);
    const playerIdRef = useRef(playerId);
    roomIdRef.current = roomId;
    playerIdRef.current = playerId;


    const handleUpdatePlayers = useCallback((roomDetails) => {
        if (roomDetails && Array.isArray(roomDetails.players)) {
            setPlayers(roomDetails.players);
        } else if (Array.isArray(roomDetails)) {
            setPlayers(roomDetails);
        }
    }, []);

    const handleError = useCallback((payload) => {
        setError(payload?.error ?? "An unknown error occurred");
    }, []);

    const handleGameStart = useCallback(({ endTime }) => {
        setEndTime(endTime);
        setGameStarted(true);
    }, []);

    useEffect(() => {
        if (!roomId) return;
        roomStateCache[roomId] = {
            gameStarted,
            endTime,
        };
    }, [roomId, gameStarted, endTime]);

    const handleGameOver = useCallback(({ loserName }) => {
        console.log('[useRoom] Game Over event received, loserName:', loserName);
        setLoser(loserName);
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
        socketManager.on("game-over", handleGameOver);

        socketManager.on("disconnect", () => setIsConnected(false));

        return () => {
            socketManager.off("connect", onConnect);
            socketManager.off("update-players", handleUpdatePlayers);
            socketManager.off("error", handleError);
            socketManager.off("game-start", handleGameStart);
            socketManager.off("game-over", handleGameOver);
        };
    }, [roomId, playerId]);

    const currentPlayer = players.find((p) => p.playerId === playerId);
    const isAdmin = currentPlayer?.isAdmin ?? false;

    const startGame = useCallback(() => {
        socketManager.emit("start-game", { roomId: roomIdRef.current, playerId: playerIdRef.current });
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
        endTime,
        loser,
        startGame,
        leaveRoom,
    };
}
