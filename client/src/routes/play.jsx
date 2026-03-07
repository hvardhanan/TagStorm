import { PhaserGame } from '../PhaserGame';
import { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';
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
        gameStarted,
        endTime,
        loser,
    } = useRoom(roomId, playerId);

    const location = useLocation();

    // if someone somehow ends up on /room before the game has started we
    // generally want to push them back to the lobby. however there are two
    // perfectly valid cases where the hook's initial state will be false:
    //  * the player is the host and they are just about to transition from
    //    the lobby themselves
    //  * the player just received the game-start event and we're
    //    redirecting them; during the unmount/mount that value may go
    //    briefly back to false before the cache is applied.
    // we guard with navigation state so that bouncing doesn't kick in in
    // those scenarios.
    const cameFromLobby = location.state?.fromLobby;
    useEffect(() => {
        if (!gameStarted && !cameFromLobby) {
            navigate(`/lobby/${roomId}`);
        }
    }, [gameStarted, navigate, roomId, cameFromLobby]);

    useEffect(() => {
        if (!gameStarted || !endTime) return;

        // create the interval first so the closure below has a valid
        // reference. we also update the timer once immediately after
        // setting it to avoid any race where the first tick would show
        // "undefined" or otherwise nothing.
        const timer = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(timer);
                setIsTimeUp(true);
            }
        }, 1000);

        // initial calculation
        const now = Date.now();
        setTimeLeft(Math.max(0, Math.floor((endTime - now) / 1000)));

        return () => clearInterval(timer);
    }, [gameStarted, endTime]);

    useEffect(() => {
        if (loser) {
            console.log('[Play] Loser updated:', loser);
            setIsTimeUp(true);
        }
    }, [loser]);

    if (!selectedMap) {
        return (
            <div className="min-h-dvh flex items-center justify-center bg-black">
                <MapSelection onMapSelect={handleMapSelect} />
            </div>
        );
    }

    return (
        <div>
            {
                isTimeUp && (
                    <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-md z-50">
                        <CardHeader>
                            <CardTitle>Loser 😭</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl font-bold text-center mb-4">{loser || 'Loading...'}</p>
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
