import React from 'react';
import { SunIcon, MoonIcon } from './icons';

interface ThemeSwitcherProps {
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, onToggleTheme }) => {
    const isDark = theme === 'dark';

    return (
        <button
            onClick={onToggleTheme}
            className={`relative w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-slate-900 ${isDark ? 'bg-slate-700' : 'bg-cyan-500'}`}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            role="switch"
            aria-checked={isDark}
        >
            <span className="sr-only">Toggle theme</span>
            <div
                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out flex items-center justify-center relative overflow-hidden ${isDark ? 'translate-x-6' : 'translate-x-0'}`}
            >
                {/* Sun Icon */}
                <div className={`absolute transition-all duration-300 ease-in-out ${isDark ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`}>
                    <SunIcon className="text-cyan-500 w-4 h-4" /> 
                </div>

                {/* Moon Icon */}
                <div className={`absolute transition-all duration-300 ease-in-out ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`}>
                    <MoonIcon className="text-slate-700 w-4 h-4" /> 
                </div>
            </div>
        </button>
    );
};
