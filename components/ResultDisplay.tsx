import React from 'react';
import { SoundIcon, TranslateIcon } from './icons';
import { Spinner } from './Spinner';

interface ResultDisplayProps {
  caption: string;
  segmentedImageUrl: string;
  onTranslate: (language: string, langCode: string) => void;
  translatedCaption: { lang: string; text: string } | null;
  isTranslating: boolean;
  onSpeak: (text: string, lang: string) => void;
}

const LANGUAGES = [
    { name: 'Spanish', code: 'es' },
    { name: 'French', code: 'fr' },
    { name: 'Hindi', code: 'hi' },
];

const RibbonHeader: React.FC<{ title: string; className?: string }> = ({ title, className }) => (
    <div className={`relative bg-green-800 text-white py-2 px-6 inline-block mb-4 ${className}`}>
        <h3 className="text-lg font-bold z-10 relative">{title}</h3>
        <div className="absolute top-0 -right-4 w-0 h-0
            border-t-[19px] border-t-transparent
            border-l-[16px] border-l-green-800
            border-b-[19px] border-b-transparent">
        </div>
    </div>
);

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
    caption, 
    segmentedImageUrl,
    onTranslate,
    translatedCaption,
    isTranslating,
    onSpeak
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Caption Section */}
      <div>
        <RibbonHeader title="Generated Caption" />
        <div className="bg-gray-700/50 p-4 rounded-lg shadow-inner flex justify-between items-start">
          <p className="text-gray-300 italic leading-relaxed text-sm flex-grow">"{caption}"</p>
          <button onClick={() => onSpeak(caption, 'en-US')} className="ml-2 p-1 text-gray-400 hover:text-green-400 transition-colors">
            <SoundIcon />
          </button>
        </div>
      </div>

      {/* Translation & Accessibility Section */}
      <div>
        <RibbonHeader title="Accessibility" />
        <div className="bg-gray-700/50 p-4 rounded-lg shadow-inner">
            <div className="flex items-center space-x-2 mb-3">
                <TranslateIcon />
                <h4 className="text-sm font-semibold text-gray-300">Translate Caption</h4>
            </div>
            <div className="flex space-x-2">
                {LANGUAGES.map(({name, code}) => (
                    <button 
                        key={code}
                        onClick={() => onTranslate(name, code)}
                        disabled={isTranslating}
                        className="text-xs bg-gray-600 hover:bg-green-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white py-1 px-2 rounded-md transition-colors"
                    >
                        {name}
                    </button>
                ))}
            </div>
            {isTranslating && (
                 <div className="flex items-center space-x-2 mt-3 text-sm text-green-300">
                    <Spinner />
                    <span>Translating...</span>
                </div>
            )}
            {translatedCaption && (
                <div className="mt-4 bg-gray-900/50 p-3 rounded-md flex justify-between items-start">
                    <p className="text-gray-300 italic leading-relaxed text-sm flex-grow">"{translatedCaption.text}"</p>
                    <button onClick={() => onSpeak(translatedCaption.text, translatedCaption.lang)} className="ml-2 p-1 text-gray-400 hover:text-green-400 transition-colors">
                        <SoundIcon />
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Images Section */}
      <div>
        <RibbonHeader title="Object Segmentation" />
        <div className="mt-2 p-4 bg-gray-700/50 rounded-lg flex items-center justify-center">
            <img 
              src={segmentedImageUrl} 
              alt="Segmented output" 
              className="max-w-full max-h-48 object-contain"
              style={{ backgroundImage: 'radial-gradient(circle, #fff2 1px, transparent 1px)', backgroundSize: '10px 10px'}}
            />
        </div>
        <p className="text-xs text-center text-gray-500 mt-2">Segmented object shown on a transparent background</p>
      </div>
    </div>
  );
};