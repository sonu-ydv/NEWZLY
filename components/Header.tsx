import React from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { NewzlyLogoIcon } from './icons';

type ActiveView = 'homepage' | 'nstudio' | 'vstudio';

interface HeaderProps {
    onClear: () => void;
    hasContent: boolean;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    onShowModal: (modal: 'privacy' | 'contact' | 'about' | 'terms') => void;
    activeView: ActiveView;
    onNavigate: (view: ActiveView) => void;
}

export const Header: React.FC<HeaderProps> = ({ onClear, hasContent, theme, onToggleTheme, onShowModal, activeView, onNavigate }) => {
  const navLinkClasses = "text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors";
  const activeLinkClasses = "text-cyan-500 dark:text-cyan-400 font-semibold";

  const renderNavLinks = () => {
      if (activeView === 'homepage') {
          return (
              <>
                <button onClick={() => onShowModal('about')} className={navLinkClasses}>About</button>
                <button onClick={() => onShowModal('privacy')} className={navLinkClasses}>Privacy Policy</button>
                <button onClick={() => onShowModal('contact')} className={navLinkClasses}>Contact</button>
              </>
          );
      }
      return (
          <>
            <button onClick={() => onNavigate('nstudio')} className={`${navLinkClasses} ${activeView === 'nstudio' ? activeLinkClasses : ''}`}>N'Studio</button>
            <button onClick={() => onNavigate('vstudio')} className={`${navLinkClasses} ${activeView === 'vstudio' ? activeLinkClasses : ''}`}>V'Studio</button>
          </>
      );
  };

  return (
    <header className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <button onClick={() => onNavigate('homepage')} aria-label="Go to Homepage" className="flex items-center gap-3">
            <NewzlyLogoIcon className="h-8 w-8 text-slate-900 dark:text-white" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-wide">
              NEWZLY
            </h1>
        </button>
        
        <div className="flex items-center gap-4">
            <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
                {renderNavLinks()}
            </nav>

            <ThemeSwitcher theme={theme} onToggleTheme={onToggleTheme} />

            {hasContent && activeView === 'nstudio' && (
                <button
                    onClick={onClear}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 ease-in-out text-sm shadow-sm hover:shadow-md"
                    aria-label="Start a new article"
                >
                    Start New
                </button>
            )}
        </div>
      </div>
    </header>
  );
};