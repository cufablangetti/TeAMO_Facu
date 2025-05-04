import React, { useState, useEffect } from 'react';
import { Play, MessageSquare, Send, Trash2 } from 'lucide-react';
import thumbnailImage from '../assets/images/c20.jpg'; // Importación directa

interface Comment {
  id: string;
  name: string;
  text: string;
  timestamp: number;
}

const VideoThumbnailPlayer: React.FC = () => {
  // Estados para el reproductor
  const [isHovered, setIsHovered] = useState(false);
  
  // Estados para los comentarios
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  
  const driveVideoUrl = "https://drive.google.com/file/d/1CAxfVeAOAqauAVsQGRmBl5YLP-If0H-Q/view?usp=sharing";

  // Cargar comentarios al iniciar
  useEffect(() => {
    const savedComments = localStorage.getItem('video-comments');
    if (savedComments) {
      try {
        setComments(JSON.parse(savedComments));
      } catch (error) {
        console.error("Error al cargar comentarios:", error);
      }
    }
  }, []);

  // Guardar comentarios cuando cambian
  useEffect(() => {
    localStorage.setItem('video-comments', JSON.stringify(comments));
  }, [comments]);

  const handleOpenVideo = () => {
    window.open(driveVideoUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userName.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      name: userName,
      text: newComment,
      timestamp: Date.now()
    };
    
    setComments([comment, ...comments]);
    setNewComment('');
    setShowCommentForm(false);
  };

  const handleDeleteComment = (id: string) => {
    setComments(comments.filter(comment => comment.id !== id));
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      {/* Sección del Video */}
      <div className="p-4">
        <div 
          className="relative cursor-pointer group aspect-video rounded-lg overflow-hidden"
          onClick={handleOpenVideo}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Ver video especial"
        >
          {/* Usamos la imagen importada directamente */}
          <img
            src={thumbnailImage}
            alt="Miniatura del video"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
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
        
        <div className="mt-4 px-2">
          <h2 className="text-xl font-semibold text-gray-800">Nuestro video especial</h2>
          <p className="text-gray-600 mt-1">Haz clic en la imagen para ver el video</p>
        </div>
      </div>
      
      {/* Sección de Comentarios (igual que en el código anterior) */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800 flex items-center">
            <MessageSquare className="mr-2" size={18} />
            Comentarios ({comments.length})
          </h3>
          <button 
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
          >
            {showCommentForm ? 'Cancelar' : 'Agregar comentario'}
          </button>
        </div>
        
        {showCommentForm && (
          <form onSubmit={handleAddComment} className="mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Tu nombre
              </label>
              <input
                type="text"
                id="name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
                maxLength={50}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                Tu comentario
              </label>
              <textarea
                id="comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
                maxLength={500}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowCommentForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center"
              >
                <Send className="mr-2" size={16} />
                Publicar
              </button>
            </div>
          </form>
        )}
        
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay comentarios aún. ¡Sé el primero en comentar!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 p-4 rounded-lg group">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-pink-600">{comment.name}</h4>
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Eliminar comentario"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-gray-800 mt-1 whitespace-pre-wrap">{comment.text}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoThumbnailPlayer;