import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/8bit/button';
import { useNavigate } from 'react-router-dom';
import { Menu } from '@/components/menu/menu';

export const Hero = () => {
    const navigate = useNavigate(null);
    const [isMobile, setIsMobile] = useState(false);

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
            {/* <img 
                src="/assets/maps/dungeon.png" 
                alt="dungeon" 
                className="absolute inset-0 w-full h-full object-cover z-0"
            /> */}
            <div>
                <Menu />
            </div>
            <div className="absolute inset-0 bg-black/40 z-10" />
            <div className="relative z-20 flex flex-col items-center">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 text-white drop-shadow-2xl">
                    Tag Storm
                </h1>
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