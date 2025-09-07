import React from 'react';
import { NewzlyLogoIcon } from './icons';

type ActiveView = 'homepage' | 'nstudio' | 'vstudio';
type ModalType = 'privacy' | 'contact' | 'about' | 'terms';

interface FooterProps {
    onNavigate: (view: ActiveView) => void;
    onShowModal: (modal: ModalType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onShowModal }) => {
    return (
        <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-16">
            <div className="container mx-auto px-4 py-16 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Bio Section */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <NewzlyLogoIcon className="h-8 w-8 text-slate-900 dark:text-white" />
                            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">NEWZLY</h3>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                            Your AI-powered suite for generating high-quality news articles, social media campaigns, and stunning summary videos in minutes.
                        </p>
                    </div>

                    {/* Quick Links Section */}
                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 tracking-wide">Quick Links</h4>
                        <ul className="space-y-3">
                            <li><button onClick={() => onNavigate('nstudio')} className="text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">N'Studio</button></li>
                            <li><button onClick={() => onNavigate('vstudio')} className="text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">V'Studio</button></li>
                        </ul>
                    </div>

                    {/* Pages Section */}
                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 tracking-wide">Resources</h4>
                        <ul className="space-y-3">
                            <li><button onClick={() => onShowModal('about')} className="text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">About</button></li>
                            <li><button onClick={() => onShowModal('contact')} className="text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">Contact</button></li>
                            <li><button onClick={() => onShowModal('privacy')} className="text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">Privacy Policy</button></li>
                            <li><button onClick={() => onShowModal('terms')} className="text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">Terms &amp; Conditions</button></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700 text-center text-sm text-slate-500 dark:text-slate-400">
                    <p>&copy; {new Date().getFullYear()} NEWZLY. All Rights Reserved.</p>
                    <p className="mt-2">Powered by the Google Gemini API</p>
                </div>
            </div>
        </footer>
    );
};