import React, { useRef, useEffect, useState } from 'react';

interface WebcamCaptureProps {
  onImageCapture: (file: File) => void;
  onBack: () => void;
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onImageCapture, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const startWebcam = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          activeStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setStream(activeStream);
          if (videoRef.current) {
            videoRef.current.srcObject = activeStream;
          }
        } else {
            setError("Your browser does not support webcam access.");
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setError("Could not access the webcam. Please ensure permissions are granted.");
      }
    };

    startWebcam();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      if (blob) {
        const file = new File([blob], `webcam-capture-${Date.now()}.png`, { type: 'image/png' });
        onImageCapture(file);
      }
    }, 'image/png');
  };
  
  if (error) {
    return (
        <div className="text-center text-red-400 p-4">
            <p>{error}</p>
            <button onClick={onBack} className="mt-4 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 py-1 px-3 rounded-md transition-colors">Go Back</button>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg mb-4" />
      <div className="flex space-x-4">
        <button onClick={onBack} className="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 px-4 rounded-md transition-colors">Back</button>
        <button onClick={handleCapture} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">Capture Photo</button>
      </div>
    </div>
  );
};