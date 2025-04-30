import React, { useState, useEffect } from 'react';

// Importación directa de todas las imágenes
import c1 from '../assets/images/c1.jpg';
import c2 from '../assets/images/c2.jpg';
import c3 from '../assets/images/c3.jpg';
import c4 from '../assets/images/c4.jpg';
import c5 from '../assets/images/c5.jpg';
import c6 from '../assets/images/c6.jpg';
import c7 from '../assets/images/c7.jpg';
import c8 from '../assets/images/c8.jpg';
import c9 from '../assets/images/c9.jpg';
import c10 from '../assets/images/c10.jpg';
import c11 from '../assets/images/c11.jpg';
import c12 from '../assets/images/c12.jpg';
import c13 from '../assets/images/c13.jpg';
import c14 from '../assets/images/c14.jpg';
import c15 from '../assets/images/c15.jpg';
import c16 from '../assets/images/c16.jpg';
import c17 from '../assets/images/c17.jpg';
import c18 from '../assets/images/c18.jpg';
import c19 from '../assets/images/c19.jpg';


const VerticalPhotoCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [shuffledPhotos, setShuffledPhotos] = useState<string[]>([]);

  // Efecto para mezclar las imágenes al montar el componente
  useEffect(() => {
    const allPhotos = [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14, c15, c16, c17, c18, c19];
    
    // Función para mezclar el array (algoritmo Fisher-Yates)
    const shuffleArray = (array: string[]) => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };

    setShuffledPhotos(shuffleArray(allPhotos));
  }, []);

  // Efecto para el auto-play
  useEffect(() => {
    let interval: number;
    
    if (isAutoPlaying && shuffledPhotos.length > 0) {
      interval = window.setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % shuffledPhotos.length);
      }, 5000); // Cambia cada 5 segundos
    }
    
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [shuffledPhotos.length, isAutoPlaying]);

  const goToPrev = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? shuffledPhotos.length - 1 : prevIndex - 1
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Reanuda después de 10s
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => 
      (prevIndex + 1) % shuffledPhotos.length
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Reanuda después de 10s
  };

  // Botón para re-mezclar las fotos
  const reshufflePhotos = () => {
    const currentPhoto = shuffledPhotos[currentIndex];
    const newShuffled = shuffleArray([...shuffledPhotos]);
    // Asegurarse que la foto actual no termine en la misma posición
    const newIndex = newShuffled.indexOf(currentPhoto);
    setShuffledPhotos(newShuffled);
    setCurrentIndex(newIndex);
  };

  if (shuffledPhotos.length === 0) {
    return (
      <div className="flex items-center justify-center h-[90vh]">
        <div className="text-xl text-gray-600">Cargando imágenes...</div>
      </div>
    );
  }

  return (
    <div className="relative max-w-md mx-auto h-[90vh] overflow-hidden rounded-xl shadow-2xl bg-gray-100">
      {/* Controles de navegación */}
      <button 
        onClick={goToPrev}
        className="absolute left-4 top-1/2 z-10 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all"
        aria-label="Foto anterior"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button 
        onClick={goToNext}
        className="absolute right-4 top-1/2 z-10 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all"
        aria-label="Foto siguiente"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Contenedor de imágenes */}
      <div className="relative h-full w-full">
        {shuffledPhotos.map((photo, index) => (
          <div
            key={`${index}-${photo}`} // Key única que cambia al mezclar
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="h-full w-full flex items-center justify-center">
              <img
                src={photo}
                alt={`Momento especial ${index + 1}`}
                className="h-full w-auto object-contain max-w-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = placeholder;
                }}
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Controles inferiores */}
      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center space-y-2">
        {/* Indicadores */}
        <div className="flex justify-center space-x-2">
          {shuffledPhotos.slice(0, 10).map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-white w-6' : 'bg-white/50 w-3'
              } ${currentIndex >= 10 && 'hidden'}`}
              onClick={() => {
                setCurrentIndex(index);
                setIsAutoPlaying(false);
                setTimeout(() => setIsAutoPlaying(true), 10000);
              }}
              aria-label={`Ir a foto ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Botón de mezclar */}
        <button
          onClick={reshufflePhotos}
          className="bg-white/30 text-white px-4 py-1 rounded-full text-sm hover:bg-white/40 transition-all flex items-center"
          aria-label="Mezclar fotos"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Mezclar
        </button>

        {/* Botón de pausa/reproducción */}
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all"
          aria-label={isAutoPlaying ? "Pausar carrusel" : "Reproducir carrusel"}
        >
          {isAutoPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default VerticalPhotoCarousel;