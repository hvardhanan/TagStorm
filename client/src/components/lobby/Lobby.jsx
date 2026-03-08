import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/8bit/card";
import { Button } from "@/components/ui/8bit/button";

export const Lobby = ({
    roomId,
    players,
    isAdmin,
    isConnected,
    error,
    onStart,
    onLeave,
}) => {
    const [dots, setDots] = useState("");
    useEffect(() => {
        const id = setInterval(() => {
            setDots((d) => (d.length >= 3 ? "" : d + "."));
        }, 500);
        return () => clearInterval(id);
    }, []);

    const [copied, setCopied] = useState(false);
    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const minPlayersToStart = 2;
    const canStart = isAdmin && players.length >= minPlayersToStart;

    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-6 w-full max-w-xl px-4">
                <Card className="w-full px-5 pt-5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg uppercase text-center w-full text-primary">
                            Room Lobby
                        </CardTitle>
                        <CardDescription className="py-2 text-center">
                            {isConnected
                                ? "Connected to server"
                                : "Connecting…"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="flex flex-col gap-2 mb-6">
                            <span className="text-sm text-muted-foreground">
                                Share this code with friends:
                            </span>
                            <div className="flex items-center gap-3">
                                <code className="flex-1 bg-muted px-4 py-3 text-center text-lg tracking-widest font-mono border border-border">
                                    {roomId}
                                </code>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyRoomId}
                                >
                                    {copied ? "✓ Copied" : "Copy"}
                                </Button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-destructive/10 text-destructive px-4 py-2 mb-4 border border-destructive/30">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium">
                                Players ({players.length})
                            </span>

                            {players.length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                    No players yet{dots}
                                </p>
                            ) : (
                                <ul className="flex flex-col gap-2">
                                    {players.map((p, idx) => (
                                        <li
                                            key={p.playerId ?? idx}
                                            className="flex items-center gap-3 bg-muted/50 px-4 py-2 border border-border"
                                        >
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                                            </span>

                                            <span className="flex-1 truncate">
                                                {p.playerId}
                                            </span>

                                            {p.isAdmin && (
                                                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 border border-primary/30 inline-flex items-center space-x-2">
                                                    <span className="">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-crown-icon lucide-crown"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>
                                                    </span>
                                                    <span>Host</span>
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {!isAdmin && players.length > 0 && (
                            <p className="text-sm text-muted-foreground mt-4 text-center">
                                ⏳ Waiting for host to start the game{dots}
                            </p>
                        )}

                        {isAdmin && players.length < minPlayersToStart && (
                            <p className="text-sm text-muted-foreground mt-4 text-center">
                                ⏳ Waiting for more players to join{dots} (
                                {minPlayersToStart - players.length} more
                                needed)
                            </p>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-row gap-3 justify-end pb-5">
                        <Button
                            className="p-5"
                            variant="outline"
                            onClick={onLeave}
                        >
                            Leave Room
                        </Button>

                        {isAdmin && (
                            <Button
                                disabled={!canStart}
                                onClick={onStart}
                                className={
                                    !canStart
                                        ? "opacity-50 cursor-not-allowed p-5"
                                        : ""
                                }
                            >
                                <span className="mr-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play-icon lucide-play"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>
                                </span>
                                Start Game
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};
