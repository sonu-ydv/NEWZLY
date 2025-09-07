import React, { useState, useCallback } from 'react';
import { generateArticleVideo } from '../services/geminiService';
import { VideoLoader } from './VideoLoader';
import { VideoPlayer } from './VideoPlayer';
import { ErrorDisplay } from './ErrorDisplay';
import { DownloadIcon, VideoIcon } from './icons';

export const VStudio: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [progressMessage, setProgressMessage] = useState<string>('');
    
    const handleGenerateVideo = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) {
            setError('Please enter a video prompt.');
            return;
        }
        
        setError(null);
        setVideoUrl(null);
        setIsLoading(true);
        
        try {
            const url = await generateArticleVideo(prompt, (message) => {
                setProgressMessage(message);
            });
            setVideoUrl(url);
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to generate video. ${errorMessage}`);
        } finally {
            setIsLoading(false);
            setProgressMessage('');
        }
    }, [prompt]);
    
    const handleStartNew = () => {
        setPrompt('');
        setVideoUrl(null);
        setError(null);
        setIsLoading(false);
    };
    
    const downloadFileName = `newzly_video_summary.mp4`;

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg dark:shadow-2xl border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">
                    V'Studio
                </h2>
                <p className="text-center text-slate-500 dark:text-slate-400 mb-6">
                    Craft a detailed prompt to generate a unique video summary.
                </p>
                
                {!videoUrl && !isLoading && (
                    <form onSubmit={handleGenerateVideo}>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., A fast-paced, energetic video about the future of AI. Scene 1: A wide shot of a futuristic city with flying vehicles. Scene 2: A close-up on a robot's hand typing on a holographic keyboard..."
                            required
                            className="w-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition duration-200 disabled:opacity-50 resize-y"
                            rows={8}
                            disabled={isLoading}
                            aria-label="Video generation prompt"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="mt-4 w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold py-4 px-6 rounded-xl transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center shadow-md hover:shadow-lg"
                        >
                             {isLoading ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                              </>
                            ) : (
                                <>
                                <VideoIcon className="w-5 h-5 mr-2" />
                                Generate Video
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
            
            <div className="mt-8">
                {error && <ErrorDisplay message={error} />}

                {isLoading && <VideoLoader progressMessage={progressMessage} />}

                {videoUrl && !isLoading && (
                    <div className="animate-fade-in">
                        <VideoPlayer videoUrl={videoUrl} />
                        <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
                            <a
                              href={videoUrl}
                              download={downloadFileName}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold py-3 px-8 rounded-lg transition-colors duration-200 bg-teal-500 hover:bg-teal-600 text-white shadow-md hover:shadow-lg"
                              aria-label="Download the generated video"
                            >
                              <DownloadIcon className="w-5 h-5" />
                              <span>Download Video</span>
                            </a>
                             <button
                                onClick={handleStartNew}
                                className="w-full sm:w-auto font-bold py-3 px-8 rounded-lg transition-colors duration-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100"
                            >
                                Create Another
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};