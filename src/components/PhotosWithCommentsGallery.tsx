import React, { useState, useEffect } from 'react';
import { MessageCircle, Calendar, Heart, Trash2, RefreshCw } from 'lucide-react';

interface PhotoWithComment {
  url: string;
  title: string;
  comment: string;
  uploadedAt: string;
}

interface PhotosWithCommentsGalleryProps {
  newPhotos: PhotoWithComment[];
}

const PhotosWithCommentsGallery: React.FC<PhotosWithCommentsGalleryProps> = ({ newPhotos }) => {
  const [photos, setPhotos] = useState<PhotoWithComment[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithComment | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [error, setError] = useState<string>('');

  // JSONBin configuración - Mismo bin que PhotoUploadWithComments
  const JSONBIN_API_KEY = '$2a$10$Nuf7k67YFnYpULzk22ylr.0qsAVr8rYiCFithtpvz6xM/6m7yC.cK';
  const JSONBIN_BIN_ID = '68caf72b43b1c97be9465daf';

  // Función para cargar fotos desde JSONBin
  const loadSharedPhotos = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
        method: 'GET',
        headers: {
          'X-Master-Key': JSONBIN_API_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const sharedPhotos = data.record?.photos || [];
        
        // Combinar fotos compartidas con nuevas fotos locales
        const allPhotos = [...sharedPhotos, ...newPhotos];
        
        // Eliminar duplicados basándose en la URL
        const uniquePhotos = allPhotos.filter((photo, index, self) => 
          index === self.findIndex(p => p.url === photo.url)
        );
        
        // Ordenar por fecha más reciente primero
        uniquePhotos.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        
        setPhotos(uniquePhotos);
        setLastRefresh(new Date().toLocaleTimeString('es-ES'));
      } else if (response.status === 404) {
        setPhotos([...newPhotos]);
        setError('No hay fotos compartidas aún. Sube la primera foto para crear la galería.');
      } else {
        const errorText = await response.text();
        console.error('JSONBin response error:', response.status, errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
    } catch (error) {
      console.error('Error loading shared photos:', error);
      setError(`Error cargando fotos: ${error.message}`);
      setPhotos([...newPhotos]);
      setLastRefresh('Error - ' + new Date().toLocaleTimeString('es-ES'));
    } finally {
      setLoading(false);
    }
  };

  // Cargar fotos al montar el componente
  useEffect(() => {
    loadSharedPhotos();
  }, []);

  // Recargar cuando hay nuevas fotos
  useEffect(() => {
    if (newPhotos.length > 0) {
      loadSharedPhotos();
    }
  }, [newPhotos]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      loadSharedPhotos();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  const handleDelete = async (photoUrl: string) => {
    try {
      const updatedPhotos = photos.filter(photo => photo.url !== photoUrl);
      setPhotos(updatedPhotos);
      
      const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_API_KEY,
        },
        body: JSON.stringify({
          photos: updatedPhotos,
          lastUpdated: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`Error updating: ${response.status}`);
      }
      
      setShowDeleteConfirm(null);
      if (selectedPhoto?.url === photoUrl) {
        setSelectedPhoto(null);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      loadSharedPhotos();
    }
  };

  const openPhotoModal = (photo: PhotoWithComment) => {
    setSelectedPhoto(photo);
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  const handleRefresh = () => {
    loadSharedPhotos();
  };

  if (loading) {
    return (
      <div className="photos-comments-gallery bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          <h3 className="text-2xl font-bold text-gray-800">Cargando fotos con comentarios...</h3>
          <p className="text-gray-600">Sincronizando desde JSONBin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="photos-comments-gallery">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-purple-500 rounded-full p-3">
            <MessageCircle className="text-white" size={24} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Fotos con Comentarios</h2>
          <div className="bg-pink-500 rounded-full p-3">
            <Heart className="text-white fill-current" size={24} />
          </div>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Momentos especiales con nuestros pensamientos y recuerdos. 
          Cada foto cuenta su propia historia.
        </p>
        
        {/* Error de configuración */}
        {error && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg max-w-md mx-auto">
            <p className="text-orange-800 font-medium text-sm">⚠️ {error}</p>
          </div>
        )}
        
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="text-sm text-purple-600 font-medium">
            {photos.length} foto{photos.length !== 1 ? 's' : ''} compartida{photos.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
            title="Refrescar galería"
            disabled={loading}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Sincronizar
          </button>
        </div>
        {lastRefresh && (
          <p className="text-xs text-gray-500 mt-2">
            Última sincronización: {lastRefresh}
          </p>
        )}
      </div>

      {/* Mensaje cuando no hay fotos */}
      {photos.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="bg-purple-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <MessageCircle className="text-purple-600" size={36} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No hay fotos con comentarios aún</h3>
          <p className="text-gray-600 mb-4">
            ¡Sube las primeras fotos con sus comentarios especiales!
          </p>
          <button
            onClick={handleRefresh}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={16} />
            Buscar fotos
          </button>
        </div>
      )}

      {/* Galería de fotos estilo feed */}
      {photos.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-6">
          {photos.map((photo, index) => (
            <div
              key={`${photo.uploadedAt}-${index}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Header de la foto */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={14} className="mr-1" />
                  {formatDate(photo.uploadedAt)}
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(photo.url)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Eliminar foto"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              {/* Imagen */}
              <div 
                className="cursor-pointer"
                onClick={() => openPhotoModal(photo)}
              >
                <img
                  src={photo.url}
                  alt={photo.title || `Foto con comentario ${index + 1}`}
                  className="w-full h-auto max-h-96 object-cover hover:opacity-95 transition-opacity"
                  loading="lazy"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    const parent = img.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-64 bg-gray-200 flex items-center justify-center"><span class="text-gray-500">Error al cargar imagen</span></div>';
                    }
                  }}
                />
              </div>
              
              {/* Comentario */}
              <div className="p-4">
                <div className="flex items-start gap-2">
                  <MessageCircle className="text-purple-500 mt-1 flex-shrink-0" size={16} />
                  <p className="text-gray-700 leading-relaxed">
                    {photo.comment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de foto ampliada */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={closePhotoModal}
        >
          <div 
            className="max-w-4xl max-h-[90vh] w-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="flex justify-between items-start mb-4 text-white">
              <div className="flex-1 mr-4">
                <h3 className="text-xl font-bold mb-2">
                  {selectedPhoto.title || 'Foto especial'}
                </h3>
                <div className="flex items-center text-sm opacity-75 mb-3">
                  <Calendar size={14} className="mr-1" />
                  {formatDate(selectedPhoto.uploadedAt)}
                </div>
                <div className="flex items-start gap-2 bg-black bg-opacity-30 rounded-lg p-3">
                  <MessageCircle className="text-purple-300 mt-1 flex-shrink-0" size={16} />
                  <p className="text-white text-sm leading-relaxed">
                    {selectedPhoto.comment}
                  </p>
                </div>
              </div>
              <button
                onClick={closePhotoModal}
                className="text-white hover:text-gray-300 text-3xl font-light flex-shrink-0"
              >
                ×
              </button>
            </div>
            
            {/* Imagen ampliada */}
            <div className="flex-1 flex items-center justify-center">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title || 'Foto con comentario'}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              ¿Eliminar foto?
            </h3>
            <p className="text-gray-600 mb-6">
              Esta foto y su comentario se eliminarán para TODOS los dispositivos. ¿Estás seguro?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotosWithCommentsGallery;