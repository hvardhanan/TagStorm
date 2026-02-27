import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SERVER_URL } from "../../config/config";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/8bit/card";
import { Button } from "@/components/ui/8bit/button";
import { Input } from "@/components/ui/8bit/input";

import axios from "axios";


export const HomeComponent = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
    const [username, setUsername] = useState("");
    const [roomId, setRoomId] = useState("");
    const [pendingAction, setPendingAction]  = useState(null);

    const handleCreateUser = async () => {
        try {
            const res = await axios.post(`${SERVER_URL}/api/user/register`, {
                playerId: username
            });
            if(res.status === 201) {
                window.localStorage.setItem('playerId', username);
            }
            setCreateUserModalOpen(false);
            setUsername("");
            if (pendingAction === "join") {
                setIsModalOpen(true);
            }
            else if(pendingAction === "create") {
                handleCreateRoom();
            }
            setPendingAction(null);
        }
        catch (error) {
            setCreateUserModalOpen(false);
            setPendingAction(null);
            console.error("Error creating user:", error);
        }
    }

    const handleCreateRoom = async () => {
        try {
            const playerId = window.localStorage.getItem('playerId');
            if (!playerId) {
                setPendingAction("create");
                setCreateUserModalOpen(true);
                return;
            }
            const res = await axios.post(`${SERVER_URL}/api/room/create`, {
                playerId
            })

            if (res.status === 201) {
                const { roomId } = res.data;
                navigate(`/room/${roomId}`);
                return;
            }
            else {
                console.log("Error creating room:", res.data.error);
                alert("Failed to create room. Please try again.");
            }
        }
        catch (error) {
            console.error("Error creating room:", error);
        }
    };

    const handleJoinRoomClick = () => {
        const playerId = window.localStorage.getItem('playerId');
        if (!playerId) {
            setPendingAction('join');
            setCreateUserModalOpen(true);
            return;
        }
        setIsModalOpen(true);
    };

    const handleJoinRoomSubmit = (e) => {
        e.preventDefault();
        if (roomId.trim()) {
            navigate(`/room/${roomId}`);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-8">
            <h1 className="text-white text-4xl">Welcome  to  the  Workspace</h1>

            <div className="flex flex-row gap-6 justify-center">
                <Card className="cursor-pointer hover:opacity-80 transition-opacity w-md" onClick={handleCreateRoom}>
                    <CardHeader>
                        <CardTitle>➕ Create Room</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Start a new session and invite others</p>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:opacity-80 transition-opacity w-md" onClick={handleJoinRoomClick}>
                    <CardHeader>
                        <CardTitle>👥 Join Room</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Enter an existing ID to join a session</p>
                    </CardContent>
                </Card>
            </div>

            {createUserModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-xl">
                        <CardHeader>
                            <CardTitle>Create a User</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-5">Please create a user profile before creating a room</p>
                            <Input
                                type="text"
                                onChange={(e) => setUsername(e.target.value)}
                                value={username}
                                placeholder="Enter Username"
                                className="border border-border bg-input px-3 py-2 w-full"
                                autoFocus
                            />
                        </CardContent>
                        <CardFooter className="flex flex-row gap-2 justify-end">
                            <Button
                                type="button"
                                className="bg-secondary text-secondary-foreground px-4 py-2"
                                onClick={() => setCreateUserModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-primary text-primary-foreground px-4 py-2"
                                onClick={handleCreateUser}
                            >
                                Create User
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-xl">
                        <CardHeader>
                            <CardTitle>Join a Room</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleJoinRoomSubmit} className="flex flex-col gap-4">
                                <Input
                                    type="text"
                                    placeholder="Enter Room ID..."
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    className="border border-border bg-input px-3 py-2 w-full"
                                    autoFocus
                                />
                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-row gap-2 justify-end">
                            <Button
                                type="button"
                                className="bg-secondary text-secondary-foreground px-4 py-2"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-primary text-primary-foreground px-4 py-2"
                                onClick={handleJoinRoomSubmit}
                            >
                                Join Now
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
};