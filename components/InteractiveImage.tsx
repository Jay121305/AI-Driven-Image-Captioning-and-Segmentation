import React, { useState, useRef, MouseEvent, RefObject } from 'react';
import { Box } from '../types';

interface InteractiveImageProps {
  imageUrl: string;
  onRegionSelect: (box: Box) => void;
  imageRef: RefObject<HTMLImageElement>;
}

export const InteractiveImage: React.FC<InteractiveImageProps> = ({ imageUrl, onRegionSelect, imageRef }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<React.CSSProperties | null>(null);
  const [finishedBox, setFinishedBox] = useState<React.CSSProperties | null>(null);

  const imageContainerRef = useRef<HTMLDivElement>(null);

  const getMousePos = (e: MouseEvent): { x: number; y: number } | null => {
    const rect = imageContainerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  
  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    const pos = getMousePos(e);
    if (!pos) return;
    setIsDrawing(true);
    setStartPoint(pos);
    setCurrentBox({
      left: pos.x,
      top: pos.y,
      width: 0,
      height: 0,
      border: '2px dashed #10B981', /* green-500 */
      position: 'absolute',
      boxSizing: 'border-box',
    });
    setFinishedBox(null);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDrawing || !startPoint) return;
    const pos = getMousePos(e);
    if (!pos) return;
  
    const left = Math.min(startPoint.x, pos.x);
    const top = Math.min(startPoint.y, pos.y);
    const width = Math.abs(startPoint.x - pos.x);
    const height = Math.abs(startPoint.y - pos.y);
  
    setCurrentBox(prev => prev ? {...prev, left, top, width, height } : null);
  };
  
  const handleMouseUp = (e: MouseEvent) => {
    if (!isDrawing || !startPoint) return;
    setIsDrawing(false);
    
    const endPoint = getMousePos(e);
    if(!endPoint) return;
    
    const finalLeft = Math.min(startPoint.x, endPoint.x);
    const finalTop = Math.min(startPoint.y, endPoint.y);
    const finalWidth = Math.abs(startPoint.x - endPoint.x);
    const finalHeight = Math.abs(startPoint.y - endPoint.y);

    if (finalWidth < 5 || finalHeight < 5) { // Ignore tiny boxes
        setCurrentBox(null);
        setStartPoint(null);
        return;
    }

    setFinishedBox({
      ...currentBox,
      left: finalLeft,
      top: finalTop,
      width: finalWidth,
      height: finalHeight,
      border: '2px solid #10B981',
    });
    setCurrentBox(null);

    // Scale coordinates to original image size
    if (imageRef.current) {
        const { naturalWidth, naturalHeight, clientWidth, clientHeight } = imageRef.current;
        const scaleX = naturalWidth / clientWidth;
        const scaleY = naturalHeight / clientHeight;

        const box: Box = {
            x1: finalLeft * scaleX,
            y1: finalTop * scaleY,
            x2: (finalLeft + finalWidth) * scaleX,
            y2: (finalTop + finalHeight) * scaleY,
        };
        onRegionSelect(box);
    }
    setStartPoint(null);
  };

  return (
    <div 
        ref={imageContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // End drawing if mouse leaves
        className="relative w-full cursor-crosshair touch-none"
        style={{ userSelect: 'none' }}
    >
        <img 
            ref={imageRef}
            src={imageUrl} 
            alt="Interactive canvas" 
            className="max-w-full max-h-[70vh] object-contain rounded-md"
            draggable="false"
        />
        {currentBox && <div style={currentBox}></div>}
        {finishedBox && <div style={finishedBox}></div>}
    </div>
  );
};