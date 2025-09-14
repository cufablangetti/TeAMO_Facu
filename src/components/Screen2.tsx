import React, { useRef, useEffect, useState } from 'react';
import EnhancedPhotoCarousel from './EnhancedPhotoCarousel';
import VideoPlayer from './VideoPlayer';
import RomanticMessage from './RomanticMessage';
import PhotoUploadImgBB from './PhotoUploadShared';
import KoreaPhotosGallery from './SharedKoreaGallery';

interface KoreaPhoto {
  url: string;
  title: string;
  uploadedAt: string;
}

const Screen2: React.FC = () => {
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [newPhotos, setNewPhotos] = useState<string[]>([]);
  const [koreaPhotos, setKoreaPhotos] = useState<KoreaPhoto[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sectionRefs.current.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  const handlePhotosUploaded = (photos: string[]) => {
    setNewPhotos(prev => [...prev, ...photos]);
    setShowSuccessMessage(true);
    
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => setShowSuccessMessage(false), 3000);
    
    // Scroll suave hacia la sección de fotos
    const photosSection = sectionRefs.current[0];
    if (photosSection) {
      photosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleKoreaPhotosUploaded = (photos: KoreaPhoto[]) => {
    setKoreaPhotos(prev => [...prev, ...photos]);
    setShowSuccessMessage(true);
    
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => setShowSuccessMessage(false), 3000);
    
    // Scroll suave hacia la sección de Corea
    const koreaSection = sectionRefs.current[3];
    if (koreaSection) {
      koreaSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="screen-2 min-h-screen bg-gradient-to-b from-pink-100 to-red-100">
      <header className="py-6 bg-pink-500 text-white text-center relative">
        <h1 className="text-3xl font-bold">Facu y Coti</h1>
        <p className="text-sm opacity-90 mt-1">Nuestros momentos, nuestros recuerdos</p>
        
        {/* Mensaje de éxito */}
        {showSuccessMessage && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-10 animate-bounce">
            ¡Fotos subidas exitosamente! 🎉
          </div>
        )}
      </header>

      {/* Sección de subida de fotos generales
      <section className="py-6 px-4 bg-pink-50 border-b border-pink-200">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold text-pink-800 mb-1">
              ¡Comparte tus momentos especiales!
            </h3>
            <p className="text-pink-600 text-sm">
              Agrega fotos a la galería principal
            </p>
          </div>
          <button
            onClick={() => handlePhotosUploaded(['placeholder'])}
            className="bg-pink-400 hover:bg-pink-500 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            📸 Subir Fotos Generales
          </button>
        </div>
      </section> */}

      {/* Sección de subida de fotos de Corea */}
      <section className="py-6 px-4 bg-gradient-to-r from-blue-50 to-red-50 border-b border-blue-200">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold text-blue-800 mb-1 flex items-center gap-2">
              Fotos del Viaje a Corea
            </h3>
            <p className="text-blue-600 text-sm">
              Comparte los momentos especiales del viaje 
            </p>
          </div>
          <PhotoUploadImgBB onPhotosUploaded={handleKoreaPhotosUploaded} />
        </div>
      </section>

      {/* Sección de fotos de Corea */}
      <section 
        ref={(el) => (sectionRefs.current[3] = el)} 
        className="py-12 px-4 opacity-0 bg-gradient-to-br from-blue-50 to-pink-50"
      >
        <div className="max-w-6xl mx-auto">
          <KoreaPhotosGallery newPhotos={koreaPhotos} />
        </div>
      </section>

      {/* Sección de galería principal */}
      <section 
        ref={(el) => (sectionRefs.current[0] = el)} 
        className="py-10 px-4 opacity-0 bg-white"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2 text-pink-800">
            Nuestros Momentos
          </h2>
          <p className="text-center text-pink-600 mb-6 text-sm">
            {newPhotos.length > 0 && `Incluye ${newPhotos.length} nueva${newPhotos.length > 1 ? 's' : ''} foto${newPhotos.length > 1 ? 's' : ''} subida${newPhotos.length > 1 ? 's' : ''}`}
          </p>
          <EnhancedPhotoCarousel newPhotos={newPhotos} />
        </div>
      </section>

      <section 
        ref={(el) => (sectionRefs.current[1] = el)} 
        className="py-10 px-4 opacity-0 bg-gradient-to-b from-pink-50 to-purple-50"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6 text-pink-800">Nuestro Video</h2>
          <VideoPlayer />
        </div>
      </section>

      <section 
        ref={(el) => (sectionRefs.current[2] = el)} 
        className="py-10 px-4 opacity-0 bg-white"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6 text-pink-800">Para Ti</h2>
          <RomanticMessage />
        </div>
      </section>

      <footer className="py-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg mb-2">Con todo mi amor ❤️</p>
          <p className="text-sm opacity-80 mb-4">
            Momentos compartidos, recuerdos eternos
          </p>
          <div className="flex justify-center items-center gap-4 text-xs opacity-75">
            <span>🇦🇷 Mendoza</span>
            <span>•</span>
            <span>🇰🇷 Corea del Sur</span>
            <span>•</span>
            <span>❤️ Para siempre</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Screen2;