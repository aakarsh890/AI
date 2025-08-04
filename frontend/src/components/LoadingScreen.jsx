import React, { useEffect } from 'react';
import { Zap } from 'lucide-react';


const LoadingScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-black to-black flex items-center justify-center z-50">
      {/* Background animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="text-center z-10">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-rose-500 rounded-full blur-xl opacity-30 animate-pulse scale-150"></div>
          <div className="relative bg-gradient-to-r from-blue-400 to-purple-400 p-6 rounded-full inline-block animate-bounce">
            <Zap className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-white mb-6 animate-fade-in">
          <span className="inline-block animate-letter-glow">W</span>
          <span className="inline-block animate-letter-glow" style={{ animationDelay: '0.1s' }}>e</span>
          <span className="inline-block animate-letter-glow" style={{ animationDelay: '0.2s' }}>b</span>
          <span className="inline-block animate-letter-glow" style={{ animationDelay: '0.3s' }}>i</span>
          <span className="inline-block animate-letter-glow" style={{ animationDelay: '0.4s' }}>f</span>
          <span className="inline-block animate-letter-glow" style={{ animationDelay: '0.5s' }}>y</span>
        </h1>

        <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto mb-4">
          <div className="h-full bg-gradient-to-r from-green-400 to-purple-400 rounded-full animate-loading-bar"></div>
        </div>

        <p className="text-blue-200 text-lg animate-pulse">
          Creating amazing web experiences...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;