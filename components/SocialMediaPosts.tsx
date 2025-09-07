import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { SocialPost } from '../types';
import { Platform } from '../types';
import { FacebookIcon, InstagramIcon, TwitterIcon, LinkedInIcon, CopyIcon, CheckIcon, RefreshIcon } from './icons';
import { generateSocialPostImage } from '../services/geminiService';

const platformIcons: { [key in Platform]: React.ReactNode } = {
  [Platform.Facebook]: <FacebookIcon />,
  [Platform.Instagram]: <InstagramIcon />,
  [Platform.Twitter]: <TwitterIcon />,
  [Platform.LinkedIn]: <LinkedInIcon />,
};

const CHARACTER_LIMITS: { [key in Platform]?: number } = {
  [Platform.Twitter]: 280,
  [Platform.Instagram]: 2200,
  [Platform.Facebook]: 5000, // Using a practical soft limit
  [Platform.LinkedIn]: 3000,
};

interface SocialMediaPostsProps {
  posts: SocialPost[];
  onRegenerate: () => void;
}

const ImageLoaderSkeleton: React.FC = () => (
    <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
);

const SocialPostCard: React.FC<{ post: SocialPost }> = ({ post }) => {
    const [caption, setCaption] = useState(post.caption);
    const [hashtags, setHashtags] = useState(post.hashtags.join(' '));
    const [copied, setCopied] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isImageLoading, setIsImageLoading] = useState(true);
    const [imageError, setImageError] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const limit = CHARACTER_LIMITS[post.platform];
    const charCount = caption.length;
    const isOverLimit = limit ? charCount > limit : false;

    // Generate image on component mount
    useEffect(() => {
        const generateImage = async () => {
            if (!post.imagePrompt) {
                setImageError("No image prompt available.");
                setIsImageLoading(false);
                return;
            }
            try {
                setImageError(null);
                setIsImageLoading(true);
                const image = await generateSocialPostImage(post.imagePrompt);
                setImageUrl(image);
            } catch (e) {
                console.error(`Failed to generate social post image for ${post.platform}`, e);
                setImageError("Couldn't generate image.");
            } finally {
                setIsImageLoading(false);
            }
        };
        generateImage();
    }, [post.imagePrompt, post.platform]);

    const getCharCountColor = () => {
        if (!limit) return 'text-slate-400';
        if (isOverLimit) return 'text-red-500 font-bold';
        if (charCount > limit * 0.9) return 'text-amber-500 font-semibold';
        return 'text-slate-500 dark:text-slate-400';
    };

    // Auto-resize textarea height
    useEffect(() => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = 'auto';
            el.style.height = `${el.scrollHeight}px`;
        }
    }, [caption]);
    
    const handleCopy = useCallback(() => {
        const textToCopy = `${caption}\n\n${hashtags}`;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [caption, hashtags]);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-50 dark:focus-within:ring-offset-slate-900 focus-within:ring-cyan-500 transition-all duration-200 animate-scale-in overflow-hidden">
            <div className="relative w-full aspect-square bg-slate-100 dark:bg-slate-700">
                {isImageLoading && <ImageLoaderSkeleton />}
                {imageError && !isImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center text-center p-4 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20">
                        <p>{imageError}</p>
                    </div>
                )}
                {imageUrl && !isImageLoading && (
                    <img src={imageUrl} alt={`${post.platform} post image`} className="w-full h-full object-cover" />
                )}
            </div>
            <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    {platformIcons[post.platform]}
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{post.platform}</h3>
                </div>
            </div>
            <div className="p-5 flex-grow flex flex-col gap-4">
                 <div>
                    <label htmlFor={`caption-${post.platform}`} className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Caption
                    </label>
                    <textarea
                        id={`caption-${post.platform}`}
                        ref={textareaRef}
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition duration-200 resize-none overflow-hidden"
                        rows={4}
                    />
                    <div className={`text-xs text-right mt-1.5 pr-1 ${getCharCountColor()}`}>
                        {charCount}{limit ? ` / ${limit}` : ''}
                    </div>
                </div>
                 <div>
                    <label htmlFor={`hashtags-${post.platform}`} className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Hashtags
                    </label>
                    <input
                        id={`hashtags-${post.platform}`}
                        type="text"
                        value={hashtags}
                        onChange={(e) => setHashtags(e.target.value)}
                        placeholder="#tagone #tagtwo #tagthree"
                        className="w-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition duration-200"
                    />
                </div>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 mt-auto">
                <button
                    onClick={handleCopy}
                    className={`w-full flex items-center justify-center gap-2 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 ${
                        copied
                        ? 'bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-300'
                        : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'
                    }`}
                >
                    {copied ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
                    <span>{copied ? 'Copied!' : 'Copy Post'}</span>
                </button>
            </div>
        </div>
    );
};


export const SocialMediaPosts: React.FC<SocialMediaPostsProps> = ({ posts, onRegenerate }) => {
  return (
    <div className="mt-8 lg:mt-0 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
          Social Toolkit
        </h2>
        <button 
            onClick={onRegenerate}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
            aria-label="Regenerate social media posts"
        >
            <RefreshIcon className="w-5 h-5" />
            <span>Regenerate</span>
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
        {posts.map((post) => (
          <SocialPostCard key={post.platform} post={post} />
        ))}
      </div>
    </div>
  );
};