import { PhaserGame } from '../PhaserGame';
import { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';
import { Lobby } from '../components/lobby/Lobby';
import { MapSelection } from '../components/mapSelection/mapSelection';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';

export const Play = () => {
    const phaserRef = useRef();
    const navigate = useNavigate();
    const { roomId } = useParams();

    const [timeLeft, setTimeLeft] = useState(null);
    const [isTimeUp, setIsTimeUp] = useState(false);

    const playerId = window.localStorage.getItem('playerId');

    useEffect(() => {
        if (!playerId) {
            navigate('/');
        }
    }, [playerId, navigate]);

    const [selectedMap, setSelectedMap] = useState(() => {
        const stored = window.localStorage.getItem('selectedMap');
        return stored || null;
    });

    const handleMapSelect = (map) => {
        window.localStorage.setItem('selectedMap', map.sceneKey);
        setSelectedMap(map.sceneKey);
    };

    const {
        players,
        isConnected,
        isAdmin,
        error,
        gameStarted,
        endTime,
        loser,
        startGame,
        leaveRoom,
    } = useRoom(roomId, playerId);

    useEffect(() => {
        if (!gameStarted || !endTime) return;

        const updateTimer = () => {
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(timer);
                setIsTimeUp(true);
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer);
    }, [gameStarted, endTime]);

    useEffect(() => {
        if (loser) {
            setIsTimeUp(true);
        }
    }, [loser]);

    const handleLeave = () => {
        window.localStorage.removeItem('selectedMap');
        leaveRoom();
        navigate('/');
    };

    if (!selectedMap) {
        return (
            <div className="min-h-dvh flex items-center justify-center bg-black">
                <MapSelection onMapSelect={handleMapSelect} />
            </div>
        );
    }

    if (!gameStarted) {
        return (
            <Lobby
                roomId={roomId}
                players={players}
                isAdmin={isAdmin}
                isConnected={isConnected}
                error={error}
                onStart={startGame}
                onLeave={handleLeave}
            />
        );
    }

    return (
        <div>
            {
                isTimeUp && (
                    <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-md">
                        <CardHeader>
                            <CardTitle>Loser 😭</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl font-bold text-center mb-4">{loser}</p>
                            <p className="text-muted-foreground text-center text-sm">Start a new session and invite others</p>
                        </CardContent>
                    </Card>
                )
            }
            <div className="absolute top-5 left-1/2 -translate-x-1/2">{timeLeft}</div>
            <PhaserGame ref={phaserRef} sceneKey={selectedMap} roomId={roomId} />
        </div>
    );
};
