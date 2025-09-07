import React from 'react';
import { ArticleIcon, VideoIcon, SocialIcon, InputIcon, PublishIcon, LogoIcon } from './icons';

interface HomepageProps {
    onNavigate: (view: 'nstudio' | 'vstudio') => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-center w-14 h-14 bg-cyan-100 dark:bg-cyan-900/50 rounded-xl mb-5">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{children}</p>
    </div>
);

const HowItWorksStep: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; step: number }> = ({ icon, title, children, step }) => (
     <div className="relative text-center">
        <div className="flex items-center justify-center w-20 h-20 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-full mx-auto shadow-sm">
           {icon}
        </div>
        <div className="absolute top-1 right-1/2 -translate-y-1/2 translate-x-[4.5rem] bg-cyan-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-4 border-white dark:border-slate-800">
            {step}
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-5 mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{children}</p>
    </div>
);

export const Homepage: React.FC<HomepageProps> = ({ onNavigate }) => {
    return (
        <div className="space-y-24 sm:space-y-32 animate-fade-in">
            {/* Hero Section */}
            <section className="text-center pt-12 pb-16">
                <h1 className="text-5xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600 leading-tight">
                    Create Smarter, Faster Content.
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                    NEWZLY is your AI-powered suite for generating high-quality news articles, social media campaigns, and stunning summary videos in minutes, not hours.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button 
                        onClick={() => onNavigate('nstudio')}
                        className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl transition duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        Launch N'Studio
                    </button>
                    <button 
                        onClick={() => onNavigate('vstudio')}
                        className="w-full sm:w-auto bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-4 px-8 rounded-xl transition-colors duration-200 border border-slate-200 dark:border-slate-700"
                    >
                        Launch V'Studio
                    </button>
                </div>
            </section>

            {/* Features Section */}
            <section>
                <div className="text-center mb-12">
                     <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Your Complete Content Toolkit</h2>
                     <p className="mt-3 max-w-xl mx-auto text-lg text-slate-500 dark:text-slate-400">Everything you need to amplify your message and engage your audience.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<ArticleIcon className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />}
                        title="AI Article Writing"
                    >
                        Transform any news URL into a unique, human-like article that's ready to publish.
                    </FeatureCard>
                    <FeatureCard
                        icon={<VideoIcon className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />}
                        title="Instant Video Creation"
                    >
                        Generate engaging, high-quality video summaries from any text prompt with our V'Studio.
                    </FeatureCard>
                    <FeatureCard
                        icon={<SocialIcon className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />}
                        title="Social Media Toolkit"
                    >
                        Automatically create optimized posts for all major platforms, complete with captions and hashtags.
                    </FeatureCard>
                </div>
            </section>
            
            {/* How It Works Section */}
            <section>
                <div className="text-center mb-16">
                     <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Simple 3-Step Process</h2>
                     <p className="mt-3 max-w-xl mx-auto text-lg text-slate-500 dark:text-slate-400">Go from idea to published content in record time.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-5xl mx-auto">
                    <HowItWorksStep
                        icon={<InputIcon className="w-9 h-9 text-purple-600 dark:text-purple-400" />}
                        title="Input"
                        step={1}
                    >
                        Provide a news URL for an article or a detailed text prompt for a video.
                    </HowItWorksStep>
                     <HowItWorksStep
                        icon={<LogoIcon className="w-9 h-9 text-purple-600 dark:text-purple-400" />}
                        title="Generate"
                        step={2}
                    >
                        Let our powerful AI analyze your input and craft original content in seconds.
                    </HowItWorksStep>
                     <HowItWorksStep
                        icon={<PublishIcon className="w-9 h-9 text-purple-600 dark:text-purple-400" />}
                        title="Publish"
                        step={3}
                    >
                        Edit, refine, and use the generated content and social posts to reach your audience.
                    </HowItWorksStep>
                </div>
            </section>

        </div>
    );
};