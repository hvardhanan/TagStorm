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
            <div className="flex flex-col items-center gap-6 w-full max-w-lg px-4">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="text-xl">
                            Room Lobby
                        </CardTitle>
                        <CardDescription>
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

                                            {p.admin && (
                                                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 border border-primary/30">
                                                    👑 Host
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

                    <CardFooter className="flex flex-row gap-3 justify-end">
                        <Button
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
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }
                            >
                                🎮 Start Game
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};
