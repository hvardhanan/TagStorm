import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/8bit/card";

export const Help = () => {
    return (
        <div className="relative w-full max-w-lg flex flex-col text-white">
            <Card className="w-full text-center">
                <CardHeader className="px-10 pt-10">
                    <CardTitle className="text-3xl uppercase">
                        <span className="text-primary">How to Play</span>
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-sm italic">
                        Don't get tagged!
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-10 py-10 flex flex-col gap-8">
                    <p className="text-sm leading-relaxed text-gray-200">
                        Sprint, dodge, and weave through the map. If you're 
                        <span className="text-primary">
                            &nbsp;It
                        </span>, tag someone else to pass the curse. Last one standing wins!
                    </p>

                    <div className="flex flex-col gap-6">
                        <h3 className="font-bold text-lg border-b-2 border-white/20 pb-1 uppercase tracking-widest text-primary">
                            Controls
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-3">
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                    Movement
                                </span>
                                <div className="flex gap-2">
                                    {['W', 'A', 'S', 'D'].map((key) => (
                                        <kbd 
                                            key={key} 
                                            className="px-3 py-1 bg-white/10 rounded border-b-4 border-white/30 font-mono text-xs shadow-lg flex items-center justify-center min-w-[32px]"
                                        >
                                            {key}
                                        </kbd>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                    Arrows
                                </span>
                                <div className="flex gap-4 text-2xl font-bold items-center leading-none">
                                    <span className="hover:text-primary transition-colors cursor-default">↑</span>
                                    <span className="hover:text-primary transition-colors cursor-default">←</span>
                                    <span className="hover:text-primary transition-colors cursor-default">↓</span>
                                    <span className="hover:text-primary transition-colors cursor-default">→</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};