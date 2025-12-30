import React, { useRef, useState, useCallback } from 'react';
import { analyzeMoodFromImage } from '../services/geminiService';

interface MoodScannerProps {
  onMoodDetected: (mood: string) => void;
  onClose: () => void;
}

export const MoodScanner: React.FC<MoodScannerProps> = ({ onMoodDetected, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please allow permissions.");
      onClose();
    }
  }, [onClose]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setAnalyzing(true);
    const context = canvasRef.current.getContext('2d');
    if (context) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
      
      const detectedMood = await analyzeMoodFromImage(imageData);
      onMoodDetected(detectedMood);
      stopCamera();
      onClose();
    }
    setAnalyzing(false);
  }, [onMoodDetected, onClose, stopCamera]);

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 relative">
        <div className="relative aspect-[3/4] bg-black">
           <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover transform scale-x-[-1]" 
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Face Overlay Guide */}
          <div className="absolute inset-0 border-2 border-dashed border-cyan-400 opacity-30 rounded-[50%] m-12 pointer-events-none"></div>
          
          {/* Scanning Animation */}
          {analyzing && (
            <div className="absolute inset-0 bg-cyan-500 bg-opacity-20 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col items-center gap-4">
          <h3 className="text-xl font-bold text-white">Detecting Vibe...</h3>
          <p className="text-gray-400 text-sm text-center">Look into the camera to capture your current mood.</p>
          
          <div className="flex gap-4 w-full">
            <button 
              onClick={onClose}
              disabled={analyzing}
              className="flex-1 py-3 px-4 rounded-xl bg-gray-800 text-gray-300 font-medium hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={captureAndAnalyze}
              disabled={!isStreaming || analyzing}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50"
            >
              {analyzing ? 'Analyzing...' : 'Scan Mood'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
