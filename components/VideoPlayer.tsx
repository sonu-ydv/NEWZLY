import React from 'react';

interface VideoPlayerProps {
    videoUrl: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
    return (
        <div className="my-8 animate-fade-in">
            <div className="relative group">
                <video
                    src={videoUrl}
                    controls
                    className="w-full rounded-lg shadow-md aspect-video"
                    aria-label="Generated article summary video"
                >
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    );
};
