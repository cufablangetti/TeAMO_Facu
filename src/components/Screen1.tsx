import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, Heart } from 'lucide-react';
import TypewriterEffect from './TypewriterEffect';
import backgroundVideo from '../assets/videos/micoti.mp4';

interface Screen1Props {
  onNavigate: () => void;
}

const Screen1: React.FC<Screen1Props> = ({ onNavigate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isHoveringCounter, setIsHoveringCounter] = useState(false);
  const [showMessage, setShowMessage] = useState(false); // Estado para controlar la visibilidad del mensaje

  // Fecha de viaje a Corea (1 de septiembre 2025)
  const targetDate = new Date(2025, 12, 27).getTime();

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeRemaining({ days, hours, minutes, seconds });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);

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
      {/* Contador regresivo vertical interactivo - Posicionado en la esquina superior izquierda */}
      <div
        className={`absolute left-4 top-4 transform z-20 transition-all duration-300 ${
          isHoveringCounter ? 'translate-x-0' : '-translate-x-3/4 hover:translate-x-0'
        }`}
        onMouseEnter={() => setIsHoveringCounter(true)}
        onMouseLeave={() => setIsHoveringCounter(false)}
      >
        <div className={`bg-pink-600 bg-opacity-90 text-white rounded-r-xl shadow-2xl p-2 transition-all duration-500 ${
          isHoveringCounter ? 'w-40' : 'w-16'
        }`}>
          <h2 className={`text-center font-bold mb-2 transition-opacity duration-200 ${
            isHoveringCounter ? 'opacity-100' : 'opacity-0'
          }`}>PARA VOLVERNOS A VER</h2>

          <div className="space-y-2">
            <div className="flex items-center">
              <div className={`bg-white bg-opacity-20 rounded-lg p-1 min-w-10 text-center transition-all duration-300 ${
                isHoveringCounter ? 'mr-2' : 'mx-auto'
              }`}>
                <div className="text-xl font-bold">{timeRemaining.days}</div>
              </div>
              {isHoveringCounter && <span className="text-xs">Días</span>}
            </div>

            <div className="flex items-center">
              <div className={`bg-white bg-opacity-20 rounded-lg p-1 min-w-10 text-center transition-all duration-300 ${
                isHoveringCounter ? 'mr-2' : 'mx-auto'
              }`}>
                <div className="text-xl font-bold">{timeRemaining.hours.toString().padStart(2, '0')}</div>
              </div>
              {isHoveringCounter && <span className="text-xs">Horas</span>}
            </div>

            <div className="flex items-center">
              <div className={`bg-white bg-opacity-20 rounded-lg p-1 min-w-10 text-center transition-all duration-300 ${
                isHoveringCounter ? 'mr-2' : 'mx-auto'
              }`}>
                <div className="text-xl font-bold">{timeRemaining.minutes.toString().padStart(2, '0')}</div>
              </div>
              {isHoveringCounter && <span className="text-xs">Minutos</span>}
            </div>

            <div className="flex items-center">
              <div className={`bg-white bg-opacity-20 rounded-lg p-1 min-w-10 text-center transition-all duration-300 ${
                isHoveringCounter ? 'mr-2' : 'mx-auto'
              }`}>
                <div className="text-xl font-bold">{timeRemaining.seconds.toString().padStart(2, '0')}</div>
              </div>
              {isHoveringCounter && <span className="text-xs">Segundos</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Botón en forma de corazón */}
      <div className="absolute right-4 top-4 z-20 flex items-center">
        <span className="mr-2 text-white text-sm">Toca para ver el mensaje del mes</span>
        <button
          onClick={() => setShowMessage(!showMessage)}
          className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 relative"
          aria-label="Mensaje del mes"
        >
          <Heart size={24} />
          {/* Indicador de nuevo mensaje */}
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            !
          </div>
        </button>
      </div>

      {/* Mensaje del mes */}
      {showMessage && (
        <div className="absolute right-4 top-20 z-20 bg-pink-500 text-white p-4 rounded-lg shadow-lg w-64 h-64 overflow-y-auto">
          Ahora ya estas en corea y yo estoy aca esperandote, como siempre digo siempre estoy pensando en vos, se que es mucho tiempo donde no nos vamos a ver, mucho tiempo dónde no vamos a tener contacto fisico, yo se que si pasamos esta etapa lo mas sano posible, estamos destinados para el uno al otro y seguir creciendo como pareja, ya que estamos aprendiendo a como superar cada obstaculo, estamos aprendiendo a saber respetar el otro estando lejos, amando desde lejos, es algo super dificil hoy en dia pero quiero que sepas que aqui estare esperandote, como ya sabes TE AMOOOO!!! 💕
        </div>
      )}

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
          <span className="mr-2">Nosotros</span>
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
