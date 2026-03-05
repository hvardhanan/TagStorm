import { maps } from "../../common/common";
import { useState } from "react";

export const MapSelection = ({ onMapSelect }) => {
    const [selectedMap, setSelectedMap] = useState(null);

    const handleSelect = (map) => {
        setSelectedMap(map.sceneKey);
        onMapSelect(map);
    };

    return (
        <div className="flex flex-col items-center w-full max-w-6xl mx-auto p-4">
            <h2 className="text-white text-4xl mb-12 tracking-tighter uppercase font-bold drop-shadow-lg">
                Select Territory
            </h2>
            
            <div className="flex flex-wrap justify-center gap-10 w-full">
                {maps.map((map) => {
                    const isSelected = selectedMap === map.sceneKey;
                    
                    return (
                        <div
                            key={map.sceneKey}
                            onClick={() => handleSelect(map)}
                            className={`relative max-w-md h-[220px] cursor-pointer transition-all duration-300 transform 
                                ${isSelected ? "scale-105" : "hover:scale-[1.02] opacity-80 hover:opacity-100"}`}
                        >
                            <img 
                                src="/assets/images/cardbg.png" 
                                alt="border" 
                                className={`absolute inset-0 w-full h-full object-stretch z-0 transition-filter duration-300
                                    ${isSelected ? "brightness-125 sepia-[.5] drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" : ""}`}
                            />

                            <div className="relative z-10 px-14 py-14 flex flex-col h-full">
                                
                                {/* <div className="relative h-40 w-full mb-4 mt-2 overflow-hidden border-2 border-white/10">
                                    <img
                                        src={map.tileMapImage}
                                        alt={map.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {isSelected && (
                                        <div className="absolute top-0 right-0 bg-yellow-400 text-black px-2 py-0.5 text-[10px] font-bold uppercase">
                                            Selected
                                        </div>
                                    )}
                                </div> */}

                                <div className="text-center">
                                    <h3 className={`text-xl font-bold mb-2 uppercase tracking-tight ${isSelected ? "text-yellow-400" : "text-white"}`}>
                                        {map.name}
                                    </h3>
                                    <p className="text-gray-300 text-xs leading-relaxed italic line-clamp-4 px-2">
                                        "{map.description}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};