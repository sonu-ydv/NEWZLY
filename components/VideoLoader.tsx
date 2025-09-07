import React, { useState, useEffect } from 'react';

const reassuringMessages = [
    "Just a moment, the AI is warming up its director's chair...",
    "Brewing some creativity for your video...",
    "Composing the perfect soundtrack...",
    "Our digital Spielberg is on the case!",
    "Polishing the pixels to perfection...",
    "Hang tight! Awesome things take a little time.",
    "The AI is working its magic, scene by scene.",
];

interface VideoLoaderProps {
    progressMessage: string;
}

export const VideoLoader: React.FC<VideoLoaderProps> = ({ progressMessage }) => {
    const [message, setMessage] = useState(reassuringMessages[0]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = reassuringMessages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % reassuringMessages.length;
                return reassuringMessages[nextIndex];
            });
        }, 4000); // Change message every 4 seconds

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="my-8 p-6 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
            <div className="flex items-center gap-4">
                <svg className="animate-spin h-8 w-8 text-teal-500 dark:text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div>
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">{progressMessage}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
                </div>
            </div>
        </div>
    );
};
