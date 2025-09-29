
import React from 'react';

const RibbonHeader: React.FC<{ title: string }> = ({ title }) => (
    <div className="relative bg-green-800 text-white py-2 px-6 inline-block">
        <h2 className="text-lg font-bold z-10 relative">{title}</h2>
        <div className="absolute top-0 -right-4 w-0 h-0
            border-t-[19px] border-t-transparent
            border-l-[16px] border-l-green-800
            border-b-[19px] border-b-transparent">
        </div>
    </div>
);


export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-green-400">Image Captioning & Segmentation</h1>
            <p className="text-sm text-gray-400">A Deep Learning Project powered by Gemini</p>
        </div>
      </div>
    </header>
  );
};
