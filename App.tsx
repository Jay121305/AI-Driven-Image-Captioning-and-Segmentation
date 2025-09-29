import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { InteractiveImage } from './components/InteractiveImage';
import { ResultDisplay } from './components/ResultDisplay';
import { Spinner } from './components/Spinner';
import { generateRegionAnalysis, translateText } from './services/geminiService';
import { DownloadIcon, ErrorIcon } from './components/icons';
import type { AppState, Box } from './types';
import { State } from './types';
import { ImageUploader } from './components/ImageUploader';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);

  const [caption, setCaption] = useState<string | null>(null);
  const [segmentedImageUrl, setSegmentedImageUrl] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>(State.Idle);
  const [error, setError] = useState<string | null>(null);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  
  const [translatedCaption, setTranslatedCaption] = useState<{ lang: string; text: string } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const originalImageRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);

    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = url;

    resetResults();
  };
  
  const resetResults = () => {
    setCaption(null);
    setSegmentedImageUrl(null);
    setError(null);
    setAppState(State.Idle);
    setSelectedBox(null);
    setTranslatedCaption(null);
  }

  const handleRegionSelect = useCallback(async (box: Box) => {
    if (!imageFile || !imageDimensions) return;

    setAppState(State.Loading);
    setError(null);
    setCaption(null);
    setSegmentedImageUrl(null);
    setSelectedBox(box);
    setTranslatedCaption(null);

    try {
      const { caption, segmentedImageUrl } = await generateRegionAnalysis(imageFile, box, imageDimensions);
      setCaption(caption);
      setSegmentedImageUrl(segmentedImageUrl);
      setAppState(State.Success);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
      setAppState(State.Error);
    }
  }, [imageFile, imageDimensions]);
  
  const resetApp = () => {
    setImageFile(null);
    setImageUrl(null);
    setImageDimensions(null);
    resetResults();
  };

  const handleTranslate = async (language: string, langCode: string) => {
    if (!caption) return;
    setIsTranslating(true);
    setTranslatedCaption(null);
    try {
      const translatedText = await translateText(caption, language);
      setTranslatedCaption({ lang: langCode, text: translatedText });
    } catch (err) {
      console.error("Translation failed:", err);
      // Optionally set a translation error state
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeak = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel(); // Stop any previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      speechSynthesis.speak(utterance);
    } else {
      alert("Sorry, your browser does not support text-to-speech.");
    }
  };

  const handleDownloadReport = async () => {
    if (!imageUrl || !segmentedImageUrl || !caption || !selectedBox || !imageDimensions) return;
  
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    const loadImg = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  
    try {
      const [originalImg, segmentedImg] = await Promise.all([loadImg(imageUrl), loadImg(segmentedImageUrl)]);
      
      // Setup canvas
      const padding = 40;
      const titleFontSize = 24;
      const textFontSize = 16;
      const textLineHeight = 22;
      const sectionSpacing = 20;
      const imageWidth = originalImg.width;
      
      // Calculate text height with wrapping
      const wrapText = (context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const words = text.split(' ');
        let line = '';
        let height = 0;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = context.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
            height += lineHeight;
          } else {
            line = testLine;
          }
        }
        context.fillText(line, x, y);
        height += lineHeight;
        return height;
      };
      
      ctx.font = `${textFontSize}px Inter, sans-serif`;
      const captionHeight = wrapText(ctx, `Caption: ${caption}`, 0, 0, imageWidth - padding * 2, textLineHeight);
      const translatedHeight = translatedCaption ? wrapText(ctx, `Translation: ${translatedCaption.text}`, 0, 0, imageWidth - padding*2, textLineHeight) : 0;
      
      const totalHeight = padding * 5 + originalImg.height + segmentedImg.height + captionHeight + translatedHeight + sectionSpacing * 3 + titleFontSize * 2;
      canvas.width = imageWidth + padding * 2;
      canvas.height = totalHeight;
  
      // Background
      ctx.fillStyle = '#111827'; // bg-gray-900
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  
      // Original Image
      let currentY = padding;
      ctx.fillStyle = '#10B981';
      ctx.font = `bold ${titleFontSize}px Inter, sans-serif`;
      ctx.fillText('Original Image & Selection', padding, currentY);
      currentY += titleFontSize + sectionSpacing / 2;
      
      ctx.drawImage(originalImg, padding, currentY, originalImg.width, originalImg.height);
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 4;
      ctx.strokeRect(padding + selectedBox.x1, currentY + selectedBox.y1, selectedBox.x2 - selectedBox.x1, selectedBox.y2 - selectedBox.y1);
      currentY += originalImg.height + padding;
  
      // Segmented Image
      ctx.fillStyle = '#10B981';
      ctx.fillText('Segmented Object', padding, currentY);
      currentY += titleFontSize + sectionSpacing / 2;
      ctx.drawImage(segmentedImg, padding, currentY, segmentedImg.width, segmentedImg.height);
      currentY += segmentedImg.height + padding;

      // Captions
      ctx.fillStyle = '#E5E7EB'; // text-gray-200
      ctx.font = `${textFontSize}px Inter, sans-serif`;
      wrapText(ctx, `Caption: ${caption}`, padding, currentY, imageWidth, textLineHeight);
      currentY += captionHeight + sectionSpacing;
      if (translatedCaption) {
        wrapText(ctx, `Translation (${translatedCaption.lang}): ${translatedCaption.text}`, padding, currentY, imageWidth, textLineHeight);
      }
  
      // Download
      const link = document.createElement('a');
      link.download = 'image-analysis-report.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
  
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Could not generate the report. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {!imageUrl ? (
            <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-2xl p-6 md:p-8">
                <ImageUploader onImageUpload={handleImageUpload} />
            </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 bg-gray-800 rounded-lg shadow-2xl p-4 flex flex-col items-center justify-center">
              <InteractiveImage 
                imageUrl={imageUrl} 
                onRegionSelect={handleRegionSelect}
                imageRef={originalImageRef}
              />
            </div>

            <div className="lg:col-span-2 bg-gray-800 rounded-lg shadow-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-green-400">Analysis Results</h2>
                <button 
                  onClick={resetApp}
                  className="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 py-1 px-3 rounded-md transition-colors"
                >
                  New Image
                </button>
              </div>
              
              {appState === State.Idle && (
                <div className="text-center text-gray-400 p-8 border-2 border-dashed border-gray-700 rounded-lg">
                  <p>Draw a box on the image to select an object for analysis.</p>
                </div>
              )}

              {appState === State.Loading && (
                <div className="flex flex-col items-center justify-center space-y-4 p-8">
                  <Spinner />
                  <p className="text-green-300 animate-pulse">AI is analyzing the selection...</p>
                </div>
              )}

              {appState === State.Error && error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative flex items-start space-x-3">
                  <div className="pt-1"><ErrorIcon /></div>
                  <div>
                    <strong className="font-bold">Analysis Failed</strong>
                    <p className="block sm:inline text-sm">{error}</p>
                  </div>
                </div>
              )}
              
              {appState === State.Success && caption && segmentedImageUrl && (
                <>
                  <ResultDisplay
                    caption={caption}
                    segmentedImageUrl={segmentedImageUrl}
                    onTranslate={handleTranslate}
                    translatedCaption={translatedCaption}
                    isTranslating={isTranslating}
                    onSpeak={handleSpeak}
                  />
                  <button
                    onClick={handleDownloadReport}
                    className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <DownloadIcon />
                    <span className="ml-2">Download Report</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;