'use client';
import { useEffect } from 'react';

export default function Toast({ message, isVisible, onClose, type = 'success', action = null }) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000); 
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose, message]);

    const isSuccess = type === 'success';

    return (
        <>
            {isVisible && (
                <div key={message?._trigger || message} className="fixed md:bottom-10 md:right-10 md:top-auto md:left-auto top-4 left-1/2 -translate-x-1/2 md:translate-x-0 z-[100] w-[90%] md:w-80 pointer-events-none transition-all duration-500">
                    <div
                        className={`
                            pointer-events-auto
                            flex items-center gap-4 p-4 rounded-2xl border
                            bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)]
                            ${isSuccess 
                                ? 'border-emerald-100 text-gray-800' 
                                : 'border-red-100 text-gray-800'}
                        `}
                    >
                        <div className={`
                            w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                            ${isSuccess ? 'bg-emerald-500/10' : 'bg-red-500/10'}
                        `}>
                            <i className={`fa-solid ${isSuccess ? 'fa-check' : 'fa-trash-can'} ${isSuccess ? 'text-emerald-500 drop-shadow-sm' : 'text-red-500 drop-shadow-sm'}`}></i>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold tracking-tight">
                                {isSuccess ? 'Success' : 'Notification'}
                            </h4>
                            <p className="text-xs opacity-90 font-medium mt-0.5">
                                {message?.title || message}
                            </p>
                        </div>

                        {action && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    action.onClick();
                                    onClose(); // Optional: close toast after clicking action
                                }}
                                className="px-3 py-1.5 bg-[#0A3D2E] hover:bg-[#10b981] text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap shadow-sm"
                            >
                                {action.label}
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 transition-colors ml-1"
                        >
                            <i className="fa-solid fa-xmark text-sm opacity-50"></i>
                        </button>

                        <div 
                            className={`
                                absolute bottom-0 left-0 right-0 h-1 rounded-full
                                ${isSuccess ? 'bg-emerald-500/40' : 'bg-red-500/40'}
                            `}
                            style={{
                                transformOrigin: 'left',
                                animation: 'toast-progress 3s linear forwards',
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
