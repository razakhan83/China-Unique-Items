'use client';

import { useEffect } from 'react';

export default function SplashScreen({ onComplete }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onComplete) onComplete();
        }, 2000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0A3D2E] animate-fadeIn">
            <div className="flex flex-col items-center gap-4 animate-fadeInUp">
                <i className="fa-solid fa-store text-6xl text-[#10b981] mb-2 drop-shadow-xl"></i>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-widest text-center">
                    CHINA <span className="text-[#10b981]">UNIQUE</span>
                    <span className="block text-2xl md:text-3xl tracking-normal font-medium text-gray-300 mt-2">
                        ITEMS
                    </span>
                </h1>
            </div>

            <div className="absolute bottom-20 flex items-center gap-3 text-white/70 text-sm font-semibold tracking-widest uppercase animate-fadeIn" style={{ animationDelay: '0.8s' }}>
                <div className="w-2 h-2 rounded-full bg-[#10b981] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-[#10b981] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-[#10b981] animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
        </div>
    );
}
