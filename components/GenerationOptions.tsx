import React from 'react';
import { TagIcon } from './icons';

const languageOptions = [
  "Chinese", "Dutch", "English", "French", "German", "Hindi", "Italian", "Japanese", "Portuguese", "Russian", "Spanish"
];

const modelOptions = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' }
];

interface GenerationOptionsProps {
  model: string;
  onModelChange: (model: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  seoKeywords: string;
  onSeoKeywordsChange: (keywords: string) => void;
  isLoading: boolean;
}

export const GenerationOptions: React.FC<GenerationOptionsProps> = ({
  model,
  onModelChange,
  language,
  onLanguageChange,
  seoKeywords,
  onSeoKeywordsChange,
  isLoading,
}) => {
  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="model-select" className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
            AI Model
          </label>
          <select
            id="model-select"
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            disabled={isLoading}
            className="w-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition duration-200 disabled:opacity-50"
            aria-label="Select AI Model"
          >
            {modelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="language-select" className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
            Language
          </label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            disabled={isLoading}
            className="w-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition duration-200 disabled:opacity-50"
            aria-label="Select output language"
          >
            {languageOptions.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="seo-keywords-input" className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
          SEO Keywords (optional)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <TagIcon className="text-slate-400 dark:text-slate-500" />
          </div>
          <input
            id="seo-keywords-input"
            type="text"
            value={seoKeywords}
            onChange={(e) => onSeoKeywordsChange(e.target.value)}
            placeholder="e.g., AI, content creation, tech trends"
            className="w-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition duration-200 disabled:opacity-50"
            disabled={isLoading}
            aria-label="Enter comma-separated SEO keywords"
          />
        </div>
      </div>
    </div>
  );
};