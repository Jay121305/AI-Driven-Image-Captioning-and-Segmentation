import React, { useState, useRef, useCallback } from 'react';
import { CameraIcon, UploadIcon } from './icons';
import { WebcamCapture } from './WebcamCapture';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
    const [mode, setMode] = useState<'upload' | 'webcam'>('upload');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            onImageUpload(file);
        }
    };
    
    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.remove('border-green-500', 'bg-gray-700/50');
        handleFileChange(event.dataTransfer.files?.[0]);
    }, [onImageUpload]);

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => event.preventDefault();
    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => event.currentTarget.classList.add('border-green-500', 'bg-gray-700/50');
    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => event.currentTarget.classList.remove('border-green-500', 'bg-gray-700/50');

    if (mode === 'webcam') {
        return <WebcamCapture onImageCapture={onImageUpload} onBack={() => setMode('upload')} />
    }

    return (
        <div>
            <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
                className="w-full border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 hover:bg-gray-700/30 transition-all duration-300 ease-in-out"
            >
                <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e.target.files?.[0] || null)} className="hidden" accept="image/png, image/jpeg, image/webp" />
                <div className="flex flex-col items-center text-gray-400">
                    <UploadIcon />
                    <p className="mt-2 font-semibold">Click to upload or drag & drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, or WEBP</p>
                </div>
            </div>
            <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-400">OR</span>
                <div className="flex-grow border-t border-gray-600"></div>
            </div>
            <button
                onClick={() => setMode('webcam')}
                className="w-full flex items-center justify-center p-4 bg-gray-700 text-gray-300 rounded-lg hover:bg-green-700 hover:text-white transition-colors"
            >
                <CameraIcon className="h-6 w-6" />
                <span className="ml-3 font-semibold">Use Webcam</span>
            </button>
        </div>
    );
};