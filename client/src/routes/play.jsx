import { PhaserGame } from '../PhaserGame';
import { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';
import { MapSelection } from '../components/mapSelection/mapSelection';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/8bit/button';

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
        gameOverDetails,
        isAdmin,
        resetRoomState,
        leaveRoom
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
        if (gameOverDetails) {
            console.log('[Play] Loser updated:', gameOverDetails.loserId);
            setIsTimeUp(true);
        }
    }, [gameOverDetails]);

    const handleRematch = () => {
        // Reset game state for rematch but keep the selected map
        setTimeLeft(null);
        setIsTimeUp(false);
        resetRoomState();

        // Navigate to lobby and wait for admin to start new game
        navigate(`/lobby/${roomId}`, { state: { fromRematch: true } });
    };

    const handleLeaveRoom = () => {
        // Clean up and return to home
        setTimeLeft(null);
        setIsTimeUp(false);
        setSelectedMap(null);
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

    return (
        <div>
            {
                isTimeUp ? (
                    <div className="h-screen w-screen flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-300 md:py-[5%]">
                        <motion.div
                            animate={{ y: [0, -15, 0], opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="relative w-32 h-32"
                        >
                            <div className="absolute inset-0 bg-slate-200 pixel-border" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 80% 20%, 100% 20%, 100% 60%, 80% 60%, 80% 80%, 100% 80%, 100% 100%, 80% 100%, 80% 80%, 60% 80%, 60% 100%, 40% 100%, 40% 80%, 20% 80%, 20% 100%, 0% 100%, 0% 80%, 20% 80%, 20% 60%, 0% 60%, 0% 20%, 20% 20%)' }}>
                                <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-black" style={{ clipPath: 'polygon(0 0, 100% 100%, 100% 0, 0 100%)' }} />
                                <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-black" style={{ clipPath: 'polygon(0 0, 100% 100%, 100% 0, 0 100%)' }} />
                            </div>
                        </motion.div>
                        <div className="text-center space-y-2">
                            <h1 className="text-5xl md:text-7xl text-[#8b0000] tracking-widest uppercase drop-shadow-[0_4px_0_rgba(0,0,0,1)]">
                                MATCH OVER
                            </h1>
                        </div>
                        <div className="max-w-xl bg-[#1a1a1a] p-8 w-full pixel-border text-center space-y-8 mt-4">
                            <div className="space-y-4">
                                <h2 className="text-2xl md:text-3xl text-white leading-relaxed">
                                    <span className="text-blue-400">{gameOverDetails?.loserId}</span><br />WAS IT!
                                </h2>
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                    THEY RAN OUT OF TIME BEFORE TAGGING ANYONE.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-[10px] text-left bg-black p-6 pixel-border">
                                <div className="text-slate-500">MATCH TIME:</div>
                                <div className="text-emerald-400 text-right">{gameOverDetails?.roomStats?.duration}</div>
                                <div className="text-slate-500">Total Players</div>
                                <div className="text-emerald-400 text-right">{gameOverDetails?.roomStats?.totalPlayers}</div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-6 pt-4 justify-end">
                                <Button
                                    onClick={handleRematch}
                                    variant="outline"
                                    className="p-5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-cw-icon lucide-rotate-cw"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
                                    REMATCH
                                </Button>
                                <Button
                                    onClick={handleLeaveRoom}
                                    className="p-5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house-icon lucide-house"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                                    LEAVE ROOM
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="absolute top-5 left-1/2 -translate-x-1/2">{timeLeft}</div>
                        <PhaserGame ref={phaserRef} sceneKey={selectedMap} roomId={roomId} />
                    </>
                )
            }
        </div>
    );
};
