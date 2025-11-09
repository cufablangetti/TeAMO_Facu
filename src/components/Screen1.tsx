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
  const [showMessage, setShowMessage] = useState(false); // Estado para controlar la visibilidad del mensaje

  useEffect(() => {
    // Fecha de viaje a Corea (27 de diciembre 2025)
    const targetDate = new Date(2025, 11, 27).getTime();

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
      {/* Contador regresivo fijo con diseño compacto */}
      <div className="absolute left-1/2 transform -translate-x-1/2 top-[30%] md:top-6 z-20">
        <div className="relative">
          {/* Título animado más pequeño */}
          <div className="text-center mb-2">
            <h2 className="text-white text-base md:text-lg font-bold drop-shadow-lg animate-pulse">
              ✨ ¡Ya queda poco! ✨
            </h2>
          </div>

          {/* Contador principal compacto */}
          <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600 rounded-xl shadow-2xl p-2 md:p-3 backdrop-blur-sm border-2 border-white/30">
            <div className="flex gap-1 md:gap-2 justify-center items-center">
              {/* Días */}
              <div className="relative group">
                <div className="bg-white/20 backdrop-blur-md rounded-lg p-1.5 md:p-2 min-w-[45px] md:min-w-[55px] transform transition-all duration-300 hover:scale-110 border border-white/40 shadow-lg">
                  <div className="text-xl md:text-2xl font-bold text-white drop-shadow-lg animate-bounce">
                    {timeRemaining.days}
                  </div>
                  <div className="text-[9px] md:text-xs text-pink-100 font-semibold uppercase tracking-wider">
                    Días
                  </div>
                </div>
                {/* Efecto de brillo */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded-lg"></div>
              </div>

              {/* Separador */}
              <span className="text-white text-xl md:text-2xl font-bold animate-pulse">:</span>

              {/* Horas */}
              <div className="relative group">
                <div className="bg-white/20 backdrop-blur-md rounded-lg p-1.5 md:p-2 min-w-[45px] md:min-w-[55px] transform transition-all duration-300 hover:scale-110 border border-white/40 shadow-lg">
                  <div className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">
                    {timeRemaining.hours.toString().padStart(2, '0')}
                  </div>
                  <div className="text-[9px] md:text-xs text-pink-100 font-semibold uppercase tracking-wider">
                    Hrs
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded-lg" style={{ animationDelay: '0.2s' }}></div>
              </div>

              {/* Separador */}
              <span className="text-white text-xl md:text-2xl font-bold animate-pulse">:</span>

              {/* Minutos */}
              <div className="relative group">
                <div className="bg-white/20 backdrop-blur-md rounded-lg p-1.5 md:p-2 min-w-[45px] md:min-w-[55px] transform transition-all duration-300 hover:scale-110 border border-white/40 shadow-lg">
                  <div className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">
                    {timeRemaining.minutes.toString().padStart(2, '0')}
                  </div>
                  <div className="text-[9px] md:text-xs text-pink-100 font-semibold uppercase tracking-wider">
                    Min
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded-lg" style={{ animationDelay: '0.4s' }}></div>
              </div>

              {/* Separador */}
              <span className="text-white text-xl md:text-2xl font-bold animate-pulse">:</span>

              {/* Segundos */}
              <div className="relative group">
                <div className="bg-white/20 backdrop-blur-md rounded-lg p-1.5 md:p-2 min-w-[45px] md:min-w-[55px] transform transition-all duration-300 hover:scale-110 border border-white/40 shadow-lg">
                  <div className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">
                    {timeRemaining.seconds.toString().padStart(2, '0')}
                  </div>
                  <div className="text-[9px] md:text-xs text-pink-100 font-semibold uppercase tracking-wider">
                    Seg
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded-lg" style={{ animationDelay: '0.6s' }}></div>
              </div>
            </div>

            {/* Corazones decorativos más pequeños */}
            <div className="flex justify-center gap-1 mt-1">
              <Heart className="text-pink-200 animate-pulse" size={10} fill="currentColor" />
              <Heart className="text-pink-200 animate-pulse" size={12} fill="currentColor" style={{ animationDelay: '0.2s' }} />
              <Heart className="text-pink-200 animate-pulse" size={10} fill="currentColor" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Botón en forma de corazón */}
      <div className="absolute right-4 top-4 z-20 flex flex-col items-center">
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
        <span className="mt-2 text-white text-xs text-center max-w-[60px] leading-tight drop-shadow-md">
          Toca para ver el mensaje del mes
        </span>
      </div>

      {/* Mensaje del mes */}
      {showMessage && (
        <div className="absolute right-4 top-20 z-20 bg-pink-500 text-white p-4 rounded-lg shadow-lg w-64 h-64 overflow-y-auto">
          TE EXTRAÑO: Ahora ya estas en corea y yo estoy aca esperandote, como siempre digo siempre estoy pensando en vos, se que es mucho tiempo donde no nos vamos a ver, mucho tiempo dónde no vamos a tener contacto fisico, yo se que si pasamos esta etapa lo mas sano posible, estamos destinados para el uno al otro y seguir creciendo como pareja, ya que estamos aprendiendo a como superar cada obstaculo, estamos aprendiendo a saber respetar el otro estando lejos, amando desde lejos, es algo super dificil hoy en dia pero quiero que sepas que aqui estare esperandote, como ya sabes TE AMOOOO!!! 💕
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
