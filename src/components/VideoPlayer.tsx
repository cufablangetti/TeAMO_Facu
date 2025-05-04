import React, { useState } from 'react';
import { Play } from 'lucide-react';
import thumbnailImage from '../assets/images/c20.jpg'; // Importación directa

interface VideoThumbnailPlayerProps {
  driveVideoUrl: string;
  title?: string;
}

const VideoThumbnailPlayer: React.FC<VideoThumbnailPlayerProps> = ({ 
  driveVideoUrl,
  title = "Nuestro momento especial" 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleOpenVideo = () => {
    window.open(driveVideoUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="video-thumbnail-player max-w-3xl mx-auto rounded-lg overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl">
      <div 
        className="relative cursor-pointer group aspect-video"
        onClick={handleOpenVideo}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`Ver video: ${title}`}
      >
        {/* Imagen importada directamente */}
        <img
          src={thumbnailImage}
          alt={`Miniatura del video: ${title}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
        
        {/* Overlay interactivo */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isHovered ? 'bg-black/30' : 'bg-black/20'
        }`}>
          <div className={`bg-pink-600 text-white rounded-full p-4 transition-all duration-300 ${
            isHovered ? 'scale-110 opacity-100' : 'scale-100 opacity-90'
          }`}>
            <Play size={32} className="fill-current" />
          </div>
        </div>
      </div>

      {/* Pie de foto */}
      <div className="bg-pink-700 text-white p-4 text-center">
        <h3 className="text-sm font-medium tracking-wide">{title}</h3>
        <p className="text-xs mt-1 opacity-80">Haz clic para ver el video</p>
      </div>
    </div>
  );
};

// Uso del componente
const VideoPlayerWrapper: React.FC = () => {
  return (
    <VideoThumbnailPlayer 
      driveVideoUrl="https://drive.google.com/file/d/1CAxfVeAOAqauAVsQGRmBl5YLP-If0H-Q/view?usp=sharing"
      title="Nuestro video especial" 
    />
  );
};

export default VideoPlayerWrapper;