import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import TypewriterEffect from './TypewriterEffect';
import backgroundVideo from '../assets/videos/micoti.mp4'; // Asegúrate que esta ruta es correcta

interface Screen1Props {
  onNavigate: () => void;
}

const Screen1: React.FC<Screen1Props> = ({ onNavigate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsVideoReady(true);
      video.play().catch(error => {
        console.error("Autoplay failed:", error);
        video.muted = true;
        video.play().catch(e => console.error("Muted play failed:", e));
      });
    };

    const handleError = () => {
      console.error("Error loading video");
      setVideoError(true);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div className="screen-1 relative h-screen w-full overflow-hidden">
      {/* Video Background with Fallback */}
      <div className="absolute inset-0 z-0">
        {!videoError ? (
          <video
            ref={videoRef}
            className={`object-cover h-full w-full transition-opacity duration-500 ${
              isVideoReady ? 'opacity-100' : 'opacity-0'
            }`}
            loop
            muted
            playsInline
            preload="auto"
          >
            <source src={backgroundVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="bg-gradient-to-br from-pink-900 to-purple-900 h-full w-full" />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <h1 className="text-white text-4xl md:text-6xl font-bold mb-8 animate-fade-in text-center">
          TE AMO COTI
        </h1>
        
        <button 
          onClick={onNavigate}
          className="bg-pink-500 hover:bg-pink-600 text-white py-3 px-6 rounded-full flex items-center transition-all duration-300 transform hover:scale-105 mb-6"
          aria-label="Nosotros"
        >
          <span className="mr-2">Continuar</span>
          <ChevronRight size={20} />
        </button>
        
        <div className="text-white text-xl md:text-2xl mt-4 h-8 text-center">
          <TypewriterEffect text="Que tengas buen viaje, siempre con vos" />
        </div>
      </div>
    </div>
  );
};

export default Screen1;