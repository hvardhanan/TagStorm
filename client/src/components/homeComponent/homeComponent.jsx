import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as styles from "./home.module.css";

export const HomeComponent = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roomId, setRoomId] = useState("");

    const handleCreateRoom = () => {
        // Logic to generate a random ID or hit an API
        const newRoomId = Math.random().toString(36).substring(2, 9);
        navigate(`/room/${newRoomId}`);
    };

    const handleJoinRoom = (e) => {
        e.preventDefault();
        if (roomId.trim()) {
            navigate(`/room/${roomId}`);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.stepHeading}>Welcome to the Workspace</h1>
            
            <div className={styles.cardContainer}>
                {/* Create Room Card */}
                <div className={styles.card} onClick={handleCreateRoom}>
                    <div className={styles.icon}>➕</div>
                    <h3>Create Room</h3>
                    <p>Start a new session and invite others.</p>
                </div>

                {/* Join Room Card */}
                <div className={styles.card} onClick={() => setIsModalOpen(true)}>
                    <div className={styles.icon}>👥</div>
                    <h3>Join Room</h3>
                    <p>Enter an existing ID to join a session.</p>
                </div>
            </div>

            {/* Join Room Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>Join a Room</h3>
                        <form onSubmit={handleJoinRoom}>
                            <input 
                                type="text" 
                                placeholder="Enter Room ID..." 
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                className={styles.input}
                                autoFocus
                            />
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.backBtn} onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.primaryBtn}>
                                    Join Now
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};