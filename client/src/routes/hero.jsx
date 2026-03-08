import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/8bit/button';
import { useNavigate } from 'react-router-dom';
import { Menu } from '@/components/menu/menu';
import { Skeleton } from "@/components/ui/8bit/skeleton"

export const Hero = () => {
    const navigate = useNavigate(null);
    const [isMobile, setIsMobile] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = "/assets/images/8bitcharacter.png";
        img.onload = () => setImageLoaded(true);
    }, []);

    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        // Check for common mobile indicators
        if (/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())) {
            setIsMobile(true);
        }
    }, []);

    if (isMobile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center text-white">
                <h1 className="text-2xl font-bold mb-4">Desktop Only</h1>
                <p>Tag Storm is currently only playable on PCs and Laptops. Please switch to a larger screen!</p>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden px-4 text-center">
            <div>
                <Menu />
            </div>
            <div className="absolute inset-0 bg-black/40 z-10" />
            <div className="relative z-20 flex flex-col items-center">
                {!imageLoaded && (
                    <Skeleton className="size-72 rounded-lg bg-white/10" />
                )}
                <img 
                    src="/assets/images/8bitcharacter.png" 
                    alt="sprite" 
                    className={`size-72 transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0 absolute'}`} 
                />
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 text-white drop-shadow-2xl mt-5">
                    Tag Storm
                </h1>
                <p className="text-lg md:text-lg font-bold tracking-tighter mb-8 text-white/60 drop-shadow-2xl">
                    A real-time multiplayer tag game
                </p>
                <Button 
                    className="hover:cursor-pointer px-10 py-6 shadow-2xl transition-transform hover:scale-105" 
                    onClick={() => navigate("/home")}
                >
                    Play Now
                </Button>
            </div>
        </div>
    );
};