import React, { useEffect, useState } from 'react';
import { Music2, Smile, Zap } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Timeline of animation
    const timer1 = setTimeout(() => setStage(1), 500); // Icons appear
    const timer2 = setTimeout(() => setStage(2), 2000); // Merge starts
    const timer3 = setTimeout(() => setStage(3), 3000); // Explosion/Logo reveal
    const timer4 = setTimeout(() => onFinish(), 4500); // Finish

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50 overflow-hidden">
      <div className="relative w-64 h-64 flex items-center justify-center">
        
        {/* Left Icon: Music */}
        <div 
          className={`absolute transition-all duration-1000 ease-in-out ${
            stage === 0 ? 'opacity-0 -translate-x-12' : 
            stage === 1 ? 'opacity-100 -translate-x-16 scale-110 text-cyan-400' :
            stage === 2 ? 'opacity-0 translate-x-0 scale-50' : 
            'opacity-0'
          }`}
        >
          <Music2 size={64} />
        </div>

        {/* Right Icon: Mood */}
        <div 
          className={`absolute transition-all duration-1000 ease-in-out ${
            stage === 0 ? 'opacity-0 translate-x-12' : 
            stage === 1 ? 'opacity-100 translate-x-16 scale-110 text-purple-500' :
            stage === 2 ? 'opacity-0 translate-x-0 scale-50' : 
            'opacity-0'
          }`}
        >
          <Smile size={64} />
        </div>

        {/* Center Merge Flash */}
        <div 
           className={`absolute w-4 h-4 bg-white rounded-full blur-xl transition-all duration-500 ${
             stage === 2 ? 'opacity-100 scale-[10]' : 'opacity-0 scale-0'
           }`}
        />

        {/* Final Logo */}
        <div 
          className={`absolute flex flex-col items-center transition-all duration-700 ${
            stage >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/50 mb-4 animate-bounce-slight">
            <Zap size={40} className="text-white fill-white" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 tracking-tight">
            VibeMusic
          </h1>
        </div>
      </div>
    </div>
  );
};