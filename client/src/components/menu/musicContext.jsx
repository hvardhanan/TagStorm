import { createContext, useContext, useState, useRef, useEffect } from "react";

const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        audioRef.current = new Audio("/assets/music/intro.mp3");
        audioRef.current.loop = true;
    }, []);

    const toggleMusic = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.error("Playback failed", e));
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <MusicContext.Provider value={{ isPlaying, toggleMusic }}>
            {children}
        </MusicContext.Provider>
    );
};

export const useMusic = () => useContext(MusicContext);