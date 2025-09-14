import React, { useState, useEffect } from 'react';

// Importación directa de todas las imágenes originales
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

interface EnhancedPhotoCarouselProps {
  newPhotos?: string[];
}

const EnhancedPhotoCarousel: React.FC<EnhancedPhotoCarouselProps> = ({ newPhotos = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [allPhotos, setAllPhotos] = useState<string[]>([]);
  const [userPhotos, setUserPhotos] = useState<string[]>([]);

  // Fotos originales
  const originalPhotos = [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14, c15, c16, c17, c18, c19];

  // Efecto para cargar fotos de usuario desde localStorage
  useEffect(() => {
    const loadUserPhotos = () => {
      try {
        const savedPhotos = JSON.parse(localStorage.getItem('userUploadedPhotos') || '[]');
        setUserPhotos(savedPhotos);
      } catch (error) {
        console.error('Error loading user photos:', error);
        setUserPhotos([]);
      }
    };

    loadUserPhotos();
    
    // Escuchar cambios en localStorage (si se suben fotos desde otra pestaña)
    const handleStorageChange = () => loadUserPhotos();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Efecto para combinar y mezclar todas las fotos
  useEffect(() => {
    const combinedPhotos = [...originalPhotos, ...userPhotos, ...newPhotos];
    
    // Función para mezclar el array (algoritmo Fisher-Yates)
    const shuffleArray = (array: string[]) => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };

    setAllPhotos(shuffleArray(combinedPhotos));
  }, [userPhotos, newPhotos]);

  // Efecto para el auto-play
  useEffect(() => {
    let interval: number;
    
    if (isAutoPlaying && allPhotos.length > 0) {
      interval = window.setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % allPhotos.length);
      }, 2000); // Cambia cada 2 segundos
    }
    
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [allPhotos.length, isAutoPlaying]);

  const goToPrev = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? allPhotos.length - 1 : prevIndex - 1
    );
    pauseAutoPlay();
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => 
      (prevIndex + 1) % allPhotos.length
    );
    pauseAutoPlay();
  };

  const pauseAutoPlay = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Reanuda después de 10s
  };

  // Botón para re-mezclar las fotos
  const reshufflePhotos = () => {
    const shuffleArray = (array: string[]) => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };

    const combinedPhotos = [...originalPhotos, ...userPhotos, ...newPhotos];
    setAllPhotos(shuffleArray(combinedPhotos));
    setCurrentIndex(0);
  };

  // Función para determinar si una foto es de usuario
  const isUserPhoto = (photoUrl: string) => {
    return photoUrl.startsWith('data:image/') || userPhotos.includes(photoUrl) || newPhotos.includes(photoUrl);
  };

  if (allPhotos.length === 0) {
    return (
      <div className="flex items-center justify-center h-[90vh]">
        <div className="text-xl text-gray-600">Cargando imágenes...</div>
      </div>
    );
  }

  return (
    <div className="relative max-w-md mx-auto h-[90vh] overflow-hidden rounded-xl shadow-2xl bg-gray-100">
      {/* Contador de fotos */}
      <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
        {currentIndex + 1} / {allPhotos.length}
        {userPhotos.length > 0 && (
          <span className="ml-2 text-xs opacity-75">
            (+{userPhotos.length + newPhotos.length} nuevas)
          </span>
        )}
      </div>

      {/* Indicador de foto de usuario */}
      {isUserPhoto(allPhotos[currentIndex]) && (
        <div className="absolute top-4 right-4 z-10 bg-pink-500 text-white px-3 py-1 rounded-full text-xs">
          ¡Foto subida!
        </div>
      )}

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
        {allPhotos.map((photo, index) => (
          <div
            key={`${index}-${photo}`}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="h-full w-full flex items-center justify-center">
              <img
                src={photo}
                alt={`Momento especial ${index + 1}${isUserPhoto(photo) ? ' - Foto subida' : ''}`}
                className="h-full w-auto object-contain max-w-full"
                onError={(e) => {
                  console.error('Error loading image:', photo);
                }}
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Controles inferiores */}
      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center space-y-3">
        {/* Indicadores de página */}
        <div className="flex justify-center space-x-2">
          {Array.from({ length: Math.min(allPhotos.length, 15) }).map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-white w-6' : 'bg-white/50 w-3'
              } ${currentIndex >= 15 && 'hidden'}`}
              onClick={() => {
                setCurrentIndex(index);
                pauseAutoPlay();
              }}
              aria-label={`Ir a foto ${index + 1}`}
            />
          ))}
          {allPhotos.length > 15 && (
            <span className="text-white text-xs px-2">...</span>
          )}
        </div>
        
        {/* Controles */}
        <div className="flex items-center space-x-3">
          {/* Botón de mezclar */}
          <button
            onClick={reshufflePhotos}
            className="bg-white/20 text-white px-3 py-1 rounded-full text-sm hover:bg-white/30 transition-all flex items-center"
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
            className="bg-black/20 text-white p-2 rounded-full hover:bg-black/40 transition-all"
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
    </div>
  );
};

export default EnhancedPhotoCarousel;