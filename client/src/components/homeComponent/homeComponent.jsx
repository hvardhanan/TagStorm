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
import { Menu } from "@/components/menu/menu";

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
                navigate(`/lobby/${roomId}`);
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
            navigate(`/lobby/${roomId}`);
        }
    }

    const CustomImageCard = ({ title, description, onClick, buttonContent }) => (
        <div 
            className="relative w-md h-96 flex flex-col items-center justify-center hover:scale-[1.02] transition-transform group"
        >
            <Card className="px-5 pt-4">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">{title}</CardTitle>
                </CardHeader>
                <CardContent className="mt-4">
                    <p className="text-sm text-center">{description}</p>
                </CardContent>
                <CardFooter className="mx-auto pb-7">
                    <Button className="px-5 py-5 cursor-pointer" onClick={onClick}>
                        {buttonContent}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-8">
            <div>
                <Menu />
            </div>
            <div className="flex flex-row gap-6 justify-center">
                <CustomImageCard
                    title="HOST" 
                    description="Start a new session and invite others" 
                    buttonContent="Create Room"
                    onClick={handleCreateRoom}
                />

                <CustomImageCard 
                    title="JOIN" 
                    description="Enter an existing ID to join a session" 
                    buttonContent="Join Now"
                    onClick={handleJoinRoomClick}
                />
            </div>

            {createUserModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-lg">
                    <Card className="w-xl px-5 pt-4">
                        <CardHeader>
                            <CardTitle className="text-center text-xl">CREATE A USER</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-5 text-[13px] text-center text-white/60">Please create a user profile before creating a room</p>
                            <Input
                                type="text"
                                onChange={(e) => setUsername(e.target.value)}
                                value={username}
                                placeholder="Enter Username"
                                className="border border-border bg-input px-3 py-5 w-full"
                                autoFocus
                            />
                        </CardContent>
                        <CardFooter className="flex flex-row gap-2 justify-end pb-7">
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-lg">
                    <Card className="w-xl px-5 pt-4">
                        <CardHeader>
                            <CardTitle className="text-center text-xl">JOIN</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleJoinRoomSubmit} className="flex flex-col gap-4">
                                <Input
                                    type="text"
                                    placeholder="Enter Room ID..."
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    className="border border-border bg-input px-3 py-5 w-full"
                                    autoFocus
                                />
                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-row gap-2 justify-end pb-7">
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