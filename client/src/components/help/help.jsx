export const Help = () => {
    return (
        <div className="relative w-full max-w-lg min-h-[500px] flex flex-col text-white overflow-hidden">
            {/* The background image */}
            <img 
                src="/assets/images/cardbg.png" 
                alt="card background" 
                className="absolute inset-0 w-full h-full object-stretch z-0 pointer-events-none"
            />

            {/* The Content - padded to sit inside the border lines */}
            <div className="relative z-10 px-16 py-16 flex flex-col gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tighter">How to Play</h2>
                    <p className="text-gray-400 text-sm italic">Don't get tagged!</p>
                </div>

                <p className="text-sm leading-relaxed text-gray-200">
                    Sprint, dodge, and weave through the dungeon. If you're "It," tag someone else to pass the curse. Last one standing wins!
                </p>

                <div className="flex flex-col gap-4">
                    <h3 className="font-bold text-lg border-b-2 border-white/20 pb-1 uppercase tracking-widest">
                        Controls
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Movement</span>
                            <div className="flex gap-2">
                                {['W', 'A', 'S', 'D'].map((key) => (
                                    <kbd key={key} className="px-3 py-1 bg-white/10 rounded border-b-4 border-white/30 font-mono text-xs shadow-lg">
                                        {key}
                                    </kbd>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Alternative</span>
                            <div className="flex gap-4 text-2xl font-bold">
                                <span>↑</span><span>←</span><span>↓</span><span>→</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}