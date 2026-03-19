'use client';
import { useEffect, useRef, useState } from 'react';

export default function Toast({ message, isVisible, onClose, type = 'success', action = null }) {
    const [shouldRender, setShouldRender] = useState(isVisible);
    const [isExiting, setIsExiting] = useState(false);
    const hideTimerRef = useRef(null);
    const exitTimerRef = useRef(null);

    useEffect(() => {
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
        }
        if (exitTimerRef.current) {
            clearTimeout(exitTimerRef.current);
        }

        if (isVisible) {
            setShouldRender(true);
            setIsExiting(false);
            hideTimerRef.current = setTimeout(() => {
                onClose();
            }, 3000);
        } else if (shouldRender) {
            setIsExiting(true);
            exitTimerRef.current = setTimeout(() => {
                setShouldRender(false);
                setIsExiting(false);
            }, 180);
        }

        return () => {
            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current);
            }
            if (exitTimerRef.current) {
                clearTimeout(exitTimerRef.current);
            }
        };
    }, [isVisible, onClose, message, shouldRender]);

    if (!shouldRender) {
        return null;
    }

    const toastKey = message?._trigger || message || 'toast';

    const handleActionClick = (event) => {
        event.stopPropagation();
        action?.onClick();
        onClose();
    };

    const handleClose = () => {
        onClose();
    };

    const isSuccess = type === 'success';

    return (
        <div
            key={toastKey}
            className="fixed left-1/2 top-4 z-[100] w-[90%] -translate-x-1/2 pointer-events-none md:left-auto md:right-10 md:top-auto md:bottom-10 md:w-80 md:translate-x-0"
        >
            <div
                className={`toast-shell ${isExiting ? 'toast-shell-exit' : 'toast-shell-enter'} ${
                    isSuccess ? 'border-emerald-100 text-gray-800' : 'border-red-100 text-gray-800'
                }`}
            >
                <div
                    className={`toast-icon ${isSuccess ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}
                >
                    <i className={`fa-solid ${isSuccess ? 'fa-check text-emerald-500' : 'fa-trash-can text-red-500'} drop-shadow-sm`}></i>
                </div>

                <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold tracking-tight">
                        {isSuccess ? 'Success' : 'Notification'}
                    </h4>
                    <p className="mt-0.5 text-xs font-medium opacity-90">
                        {message?.title || message}
                    </p>
                </div>

                {action ? (
                    <button
                        onClick={handleActionClick}
                        className="whitespace-nowrap rounded-lg bg-[#0A3D2E] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#10b981]"
                    >
                        {action.label}
                    </button>
                ) : null}

                <button
                    onClick={handleClose}
                    className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
                >
                    <i className="fa-solid fa-xmark text-sm opacity-50"></i>
                </button>

                <div
                    key={`progress-${toastKey}`}
                    className={`toast-progress ${isSuccess ? 'bg-emerald-500/40' : 'bg-red-500/40'}`}
                />
            </div>
        </div>
    );
}
