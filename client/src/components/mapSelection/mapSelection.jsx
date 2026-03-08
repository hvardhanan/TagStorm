import { maps } from "../../common/common";
import { useState } from "react";
import { Skeleton } from "@/components/ui/8bit/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card";

// Internal component to manage the image loading state per map
const MapImage = ({ src, alt }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className="relative h-40 w-full overflow-hidden border border-white/10 bg-muted">
            {!isLoaded && (
                <Skeleton className="absolute inset-0 w-full h-full bg-white/10 animate-pulse" />
            )}
            <img
                src={src}
                alt={alt}
                onLoad={() => setIsLoaded(true)}
                className={`w-full h-full object-cover transition-all duration-500 hover:scale-110 
                    ${isLoaded ? "opacity-100" : "opacity-0"}`}
            />
        </div>
    );
};

export const MapSelection = ({ onMapSelect }) => {
    return (
        <div className="flex flex-col items-center w-full max-w-6xl mx-auto p-4">
            <h2 className="text-white text-4xl mb-12 tracking-tighter uppercase font-bold drop-shadow-lg">
                Select a Map
            </h2>
            
            <div className="flex flex-wrap justify-center gap-10 w-full">
                {maps.map((map) => {
                    return (
                        <div
                            key={map.sceneKey}
                            onClick={() => onMapSelect(map)}
                            className="relative max-w-md h-[320px] cursor-pointer transition-all duration-300 transform hover:scale-105 opacity-90 hover:opacity-100"
                        >
                            <Card className="px-5 pt-4 h-full">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg uppercase text-center w-full text-white">
                                            {map.name}
                                        </CardTitle>
                                    </div>
                                </CardHeader>

                                <CardContent className="flex flex-col gap-4">
                                    <MapImage src={map.tileMapImage} alt={map.name} />

                                    <div className="text-center pb-2">
                                        <p className="text-white/60 text-xs leading-relaxed italic line-clamp-3">
                                            "{map.description}"
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    );
                })}

                {/* Coming Soon Card */}
                <div className="relative w-full max-w-sm h-[320px] opacity-40 grayscale pointer-events-none">
                    <Card className="px-5 pt-4 border-dashed border-white/20 h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg uppercase text-white/50 text-center w-full italic">
                                ???
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4 items-center justify-center pt-4">
                            <div className="h-24 w-24 flex items-center justify-center border border-white/10 bg-black/20 rounded-full">
                                <span className="text-3xl text-white/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock-icon lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                </span>
                            </div>
                            <div className="text-center">
                                <p className="text-white/40 font-bold uppercase tracking-widest">
                                    More Maps Coming Soon
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};