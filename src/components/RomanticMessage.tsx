import React, { useState } from 'react';
import { Heart } from 'lucide-react';

const RomanticMessage: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; left: string; animationDuration: string }[]>([]);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const createHeart = () => {
    const id = Date.now();
    const left = `${Math.random() * 100}%`;
    const animationDuration = `${Math.random() * 3 + 2}s`;
    
    setHearts(prevHearts => [...prevHearts, { id, left, animationDuration }]);
    
    setTimeout(() => {
      setHearts(prevHearts => prevHearts.filter(heart => heart.id !== id));
    }, 5000);
  };

  return (
    <div 
      className="romantic-message max-w-xl mx-auto bg-white rounded-lg p-6 shadow-lg relative overflow-hidden"
      onMouseEnter={createHeart}
      onClick={createHeart}
    >
      <div className="text-center mb-4">
        <Heart 
          className="inline-block text-pink-500 animate-pulse" 
          size={32} 
          fill="#ec4899"
        />
      </div>
      
      <div className="message-content text-center">
        <h3 className="text-xl font-bold text-pink-800 mb-3">5 de enero de 2024</h3>
        
        <p className="text-gray-700 mb-4">
          Cada día a tu lado es un regalo. Tu sonrisa ilumina mi mundo y tu amor me da fuerzas para enfrentar cualquier desafío.
        </p>
        
        {expanded && (
          <div className="expanded-content animate-fade-in">
            <p className="text-gray-700 mb-4">
              Aunque estemos separados por un tiempo, mi corazón siempre estará contigo. 
              Extrañaré cada momento juntos, pero sé que pronto volveremos a encontrarnos.
            </p>
            <p className="text-gray-700 mb-4">
              Te amo más de lo que las palabras pueden expresar. Eres mi presente y mi futuro.
              Disfruta tu viaje, siempre estaré esperándote con los brazos abiertos.
            </p>
          </div>
        )}
        
        <button
          onClick={toggleExpand}
          className="text-pink-600 hover:text-pink-800 font-medium"
        >
          {expanded ? "Leer menos" : "Leer más"}
        </button>
      </div>
      
      {/* Floating hearts animation */}
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="absolute bottom-0 text-pink-500 animate-float-up pointer-events-none"
          style={{ 
            left: heart.left, 
            animationDuration: heart.animationDuration 
          }}
        >
          <Heart fill="#ec4899" />
        </div>
      ))}
    </div>
  );
};

export default RomanticMessage;