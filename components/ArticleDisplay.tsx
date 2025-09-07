import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import type { Article } from '../types';
import { CopyIcon, CheckIcon, EditIcon, SaveIcon } from './icons';

interface ArticleDisplayProps {
  article: Article;
  onArticleUpdate: (updatedArticle: Article) => void;
  featureImage: string | null;
  onGenerateSocial: () => void;
  isSocialLoading: boolean;
}

const renderFormattedContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => {
        const trimmed = paragraph.trim();
        if (trimmed.startsWith('## ')) {
            return <h2 key={index} className="text-2xl font-bold mt-8 mb-4 text-cyan-600 dark:text-cyan-300">{trimmed.substring(3)}</h2>;
        }
        if (trimmed === '') {
            return null;
        }
        return <p key={index} className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-base">{trimmed}</p>;
    });
};

export const ArticleDisplay: React.FC<ArticleDisplayProps> = ({ 
    article, 
    onArticleUpdate, 
    featureImage, 
    onGenerateSocial, 
    isSocialLoading,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(article.title);
  const [editedContent, setEditedContent] = useState(article.articleContent);
  const [copied, setCopied] = useState(false);

  const formattedContent = useMemo(() => renderFormattedContent(article.articleContent), [article.articleContent]);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (isEditing && contentTextareaRef.current) {
        const el = contentTextareaRef.current;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    }
  }, [isEditing, editedContent]);

  const handleCopy = useCallback(() => {
    const textToCopy = `${article.title}\n\n${article.articleContent}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [article.title, article.articleContent]);

  const handleSaveChanges = () => {
    onArticleUpdate({
      ...article,
      title: editedTitle,
      articleContent: editedContent,
    });
    setIsEditing(false);
  };
  
  const handleToggleEdit = () => {
    if(isEditing) {
      handleSaveChanges();
    } else {
      setEditedTitle(article.title);
      setEditedContent(article.articleContent);
      setIsEditing(true);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in">
      <div className="p-6 sm:p-8">
        {isEditing ? (
            <input 
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full text-3xl sm:text-4xl font-extrabold mb-6 bg-slate-100 dark:bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none"
            />
        ) : (
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600">
              {article.title}
            </h2>
        )}
        
        <div className="mb-4">
          <div className="aspect-video w-full bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center animate-fade-in overflow-hidden">
              {featureImage ? (
                  <img src={featureImage} alt={article.title} className="w-full h-full object-cover" />
              ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
                      <svg className="animate-spin h-8 w-8 text-cyan-500 dark:text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generating Image...</span>
                  </div>
              )}
          </div>
        </div>

        <div className="mt-8">
            {isEditing ? (
                <textarea
                    ref={contentTextareaRef}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition duration-200 resize-none overflow-hidden leading-relaxed"
                    rows={15}
                />
            ) : (
                <article>
                {formattedContent}
                </article>
            )}
        </div>

      </div>
      
      <div className="sticky bottom-4 z-10 px-4">
        <div className="max-w-xl mx-auto bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-3 flex flex-col sm:flex-row justify-center items-center gap-3 rounded-2xl shadow-lg">
            <button
                onClick={handleCopy}
                disabled={isEditing}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 font-bold py-2 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    copied
                    ? 'bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-300'
                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                }`}
            >
                {copied ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
                <span>{copied ? 'Copied!' : 'Copy Article'}</span>
            </button>
            <button
                onClick={handleToggleEdit}
                className="w-full sm:w-auto flex items-center justify-center gap-2 font-bold py-2 px-6 rounded-lg transition-colors duration-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isEditing ? <SaveIcon className="w-5 h-5" /> : <EditIcon className="w-5 h-5" />}
                <span>{isEditing ? 'Save Changes' : 'Edit Article'}</span>
            </button>
            <button
                onClick={onGenerateSocial}
                disabled={isSocialLoading || isEditing}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center shadow-md hover:shadow-lg"
            >
              {isSocialLoading ? 'Generating...' : 'Create Social Posts'}
            </button>
        </div>
      </div>
    </div>
  );
};