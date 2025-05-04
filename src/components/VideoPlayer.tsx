import React, { useState, useEffect } from 'react';
import { Play, MessageSquare, Send, Trash2 } from 'lucide-react';
import thumbnailImage from '../assets/images/c20.jpg';

// Configuración de JSONBin.io (crea tu cuenta en https://jsonbin.io/)
const JSONBIN_BIN_ID = '6816bbe38960c979a592ed22'; // Reemplaza con tu ID de bin
const JSONBIN_API_KEY = '$2a$10$Ac2xgqogPf4dxZ7dKI3.zOpAWPGD6gA8RU4288rIGAfWh/9Sq2d4O'; // Reemplaza con tu API key

interface Comment {
  id: string;
  name: string;
  text: string;
  timestamp: number;
}

const VideoThumbnailPlayer: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const driveVideoUrl = "https://drive.google.com/file/d/1CAxfVeAOAqauAVsQGRmBl5YLP-If0H-Q/view?usp=sharing";

  // Cargar comentarios desde JSONBin.io
  const loadComments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
        headers: {
          'X-Master-Key': JSONBIN_API_KEY
        }
      });
      
      if (!response.ok) throw new Error('Error al cargar comentarios');
      
      const data = await response.json();
      setComments(data.record || []);
      setError('');
    } catch (err) {
      console.error("Error:", err);
      setError('No se pudieron cargar los comentarios. Intenta recargar la página.');
      // Cargar desde localStorage como respaldo
      const localComments = localStorage.getItem('comments-backup');
      if (localComments) setComments(JSON.parse(localComments));
    } finally {
      setIsLoading(false);
    }
  };

  // Guardar comentarios en JSONBin.io
  const saveComments = async (updatedComments: Comment[]) => {
    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_API_KEY
        },
        body: JSON.stringify(updatedComments)
      });
      
      if (!response.ok) throw new Error('Error al guardar');
      
      // Guardar también en localStorage como respaldo
      localStorage.setItem('comments-backup', JSON.stringify(updatedComments));
    } catch (err) {
      console.error("Error al guardar:", err);
      // Guardar solo en localStorage si falla
      localStorage.setItem('comments-backup', JSON.stringify(updatedComments));
    }
  };

  // Cargar comentarios al iniciar
  useEffect(() => {
    loadComments();
    
    // Opcional: Actualizar cada 30 segundos para ver nuevos comentarios
    const interval = setInterval(loadComments, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenVideo = () => {
    window.open(driveVideoUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userName.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      name: userName,
      text: newComment,
      timestamp: Date.now()
    };
    
    const updatedComments = [comment, ...comments];
    setComments(updatedComments);
    setNewComment('');
    setShowCommentForm(false);
    
    // Guardar en JSONBin.io
    await saveComments(updatedComments);
  };

  const handleDeleteComment = async (id: string) => {
    const updatedComments = comments.filter(comment => comment.id !== id);
    setComments(updatedComments);
    
    // Guardar en JSONBin.io
    await saveComments(updatedComments);
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
      
      {/* Sección de Comentarios */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800 flex items-center">
            <MessageSquare className="mr-2" size={18} />
            Comentarios ({comments.length})
          </h3>
          <button 
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
            disabled={isLoading}
          >
            {showCommentForm ? 'Cancelar' : 'Agregar comentario'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
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
                disabled={isLoading}
              >
                {isLoading ? (
                  'Enviando...'
                ) : (
                  <>
                    <Send className="mr-2" size={16} />
                    Publicar
                  </>
                )}
              </button>
            </div>
          </form>
        )}
        
        {isLoading && comments.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-600"></div>
          </div>
        ) : (
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
                          disabled={isLoading}
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
        )}
      </div>
    </div>
  );
};

export default VideoThumbnailPlayer;