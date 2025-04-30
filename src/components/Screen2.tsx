import React, { useRef, useEffect } from 'react';
import PhotoCarousel from './PhotoCarousel';
import VideoPlayer from './VideoPlayer';
import RomanticMessage from './RomanticMessage';

const Screen2: React.FC = () => {
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

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

  return (
    <div className="screen-2 min-h-screen bg-gradient-to-b from-pink-100 to-red-100">
      <header className="py-6 bg-pink-500 text-white text-center">
        <h1 className="text-3xl font-bold">Facu y Coti</h1>
      </header>

      <section 
        ref={(el) => (sectionRefs.current[0] = el)} 
        className="py-10 px-4 opacity-0"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-pink-800">Nuestros Momentos</h2>
        <PhotoCarousel />
      </section>

      <section 
        ref={(el) => (sectionRefs.current[1] = el)} 
        className="py-10 px-4 opacity-0 bg-white"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-pink-800">Nuestro Video</h2>
        <VideoPlayer />
      </section>

      <section 
        ref={(el) => (sectionRefs.current[2] = el)} 
        className="py-10 px-4 opacity-0"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-pink-800">Para Ti</h2>
        <RomanticMessage />
      </section>

      <footer className="py-4 bg-pink-500 text-white text-center">
        <p>Con todo mi amor ❤️</p>
      </footer>
    </div>
  );
};

export default Screen2;