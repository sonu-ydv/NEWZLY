import React from 'react';
import { CheckIcon } from './icons';

interface LoaderProps {
  steps: {
      text: string;
      status: 'pending' | 'active' | 'done';
  }[];
}

const StatusIcon: React.FC<{ status: 'pending' | 'active' | 'done' }> = ({ status }) => {
    if (status === 'done') {
        return <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"><CheckIcon className="w-4 h-4 text-white" /></div>;
    }
    if (status === 'active') {
        return (
            <div className="w-6 h-6">
                <svg className="animate-spin text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }
    return <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>;
};

export const Loader: React.FC<LoaderProps> = ({ steps }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg dark:shadow-2xl border border-slate-200 dark:border-slate-700 animate-fade-in">
      <div className="flex flex-col gap-4">
        {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-4 transition-opacity duration-300">
                <StatusIcon status={step.status} />
                <p className={`text-lg ${step.status === 'pending' ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
                    {step.text}
                </p>
            </div>
        ))}
      </div>
    </div>
  );
};
