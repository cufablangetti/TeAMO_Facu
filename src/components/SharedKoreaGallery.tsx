import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Heart, Trash2, RefreshCw } from 'lucide-react';

interface KoreaPhoto {
  url: string;
  title: string;
  uploadedAt: string;
}

interface SharedKoreaGalleryProps {
  newPhotos: KoreaPhoto[];
}

const SharedKoreaGallery: React.FC<SharedKoreaGalleryProps> = ({ newPhotos }) => {
  const [photos, setPhotos] = useState<KoreaPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<KoreaPhoto | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string>('');

  // JSONBin configuración (mismo que el componente de subida)
  const JSONBIN_API_KEY = '$2a$10$Vq8QoM1m.rGlGbEHZBWzee1Q5hLZ6zF7xN1H9kT8vO3pR5yE2iC4K';

  // Función para cargar fotos desde el servicio compartido
  const loadSharedPhotos = async () => {
    try {
      setLoading(true);
      
      // Intentar cargar desde JSONBin (servicio compartido)
      const response = await fetch('https://api.jsonbin.io/v3/b/korea-photos-shared', {
        headers: {
          'X-Master-Key': JSONBIN_API_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const sharedPhotos = data.record?.photos || [];
        
        // Combinar fotos compartidas con nuevas fotos
        const allPhotos = [...sharedPhotos, ...newPhotos];
        
        // Eliminar duplicados basándose en la URL
        const uniquePhotos = allPhotos.filter((photo, index, self) => 
          index === self.findIndex(p => p.url === photo.url)
        );
        
        setPhotos(uniquePhotos);
        setLastRefresh(new Date().toLocaleTimeString());
      } else {
        throw new Error('No se pudieron cargar las fotos compartidas');
      }
      
    } catch (error) {
      console.error('Error loading shared photos:', error);
      
      // Fallback: cargar desde localStorage
      try {
        const localPhotos = JSON.parse(localStorage.getItem('koreaPhotos') || '[]');
        const allPhotos = [...localPhotos, ...newPhotos];
        
        const uniquePhotos = allPhotos.filter((photo, index, self) => 
          index === self.findIndex(p => p.url === photo.url)
        );
        
        setPhotos(uniquePhotos);
        setLastRefresh('Modo local - ' + new Date().toLocaleTimeString());
      } catch (localError) {
        console.error('Error loading local photos:', localError);
        setPhotos([...newPhotos]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar fotos al montar el componente y cuando lleguen nuevas fotos
  useEffect(() => {
    loadSharedPhotos();
  }, [newPhotos]);

  // Refrescar automáticamente cada 30 segundos
  useEffect(() => {
    const interval = setInterval(loadSharedPhotos, 30000);
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
      // Filtrar la foto del estado local
      const updatedPhotos = photos.filter(photo => photo.url !== photoUrl);
      setPhotos(updatedPhotos);
      
      // Actualizar en el servicio compartido
      await fetch('https://api.jsonbin.io/v3/b/korea-photos-shared', {
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
      
      // Actualizar localStorage como respaldo
      localStorage.setItem('koreaPhotos', JSON.stringify(updatedPhotos));
      
      // Cerrar confirmación
      setShowDeleteConfirm(null);
      
      // Cerrar modal si la foto eliminada estaba seleccionada
      if (selectedPhoto?.url === photoUrl) {
        setSelectedPhoto(null);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      // En caso de error, recargar las fotos
      loadSharedPhotos();
    }
  };

  const openPhotoModal = (photo: KoreaPhoto) => {
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
      <div className="korea-photos-gallery bg-gradient-to-br from-blue-50 to-pink-50 rounded-xl p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <h3 className="text-2xl font-bold text-gray-800">Cargando fotos de Corea...</h3>
          <p className="text-gray-600">Sincronizando con todos los dispositivos</p>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="korea-photos-gallery bg-gradient-to-br from-blue-50 to-pink-50 rounded-xl p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-blue-100 rounded-full p-4">
            <MapPin className="text-blue-600" size={48} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Viaje en Corea</h3>
          <p className="text-gray-600 max-w-md">
            Aún no hay fotos del viaje compartidas. ¡Sube las primeras fotos para que todos las vean!
          </p>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw size={16} />
            Buscar fotos nuevas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="korea-photos-gallery">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-blue-500 rounded-full p-3">
            <MapPin className="text-white" size={24} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Viaje en Corea</h2>
          <div className="bg-red-500 rounded-full p-3">
            <Heart className="text-white fill-current" size={24} />
          </div>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Compartiendo los momentos más hermosos del viaje a Corea. 
          Cada foto cuenta una historia especial de esta aventura. 🇰🇷
        </p>
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="text-sm text-blue-600 font-medium">
            {photos.length} foto{photos.length !== 1 ? 's' : ''} compartida{photos.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
            title="Refrescar galería"
          >
            <RefreshCw size={12} />
            Actualizar
          </button>
        </div>
        {lastRefresh && (
          <p className="text-xs text-gray-500 mt-2">
            Última actualización: {lastRefresh}
          </p>
        )}
      </div>

      {/* Galería de fotos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <div
            key={`${photo.url}-${index}`}
            className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
            onClick={() => openPhotoModal(photo)}
          >
            {/* Imagen */}
            <div className="aspect-square overflow-hidden">
              <img
                src={photo.url}
                alt={photo.title || `Foto de Corea ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  const parent = img.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><span class="text-gray-500">Error al cargar</span></div>';
                  }
                }}
              />
            </div>
            
            {/* Overlay con información */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
              <div className="text-white">
                <div className="flex items-center text-xs mb-1">
                  <Calendar size={12} className="mr-1" />
                  {formatDate(photo.uploadedAt)}
                </div>
                <div className="text-sm font-medium truncate">
                  {photo.title || 'Momento en Corea'}
                </div>
              </div>
            </div>

            {/* Botón de eliminar */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(photo.url);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              title="Eliminar foto"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Modal de foto ampliada */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl max-h-[90vh] w-full flex flex-col">
            {/* Header del modal */}
            <div className="flex justify-between items-center mb-4 text-white">
              <div>
                <h3 className="text-xl font-bold">
                  {selectedPhoto.title || 'Momento en Corea'}
                </h3>
                <p className="text-sm opacity-75 flex items-center">
                  <Calendar size={14} className="mr-1" />
                  {formatDate(selectedPhoto.uploadedAt)}
                </p>
              </div>
              <button
                onClick={closePhotoModal}
                className="text-white hover:text-gray-300 text-3xl"
              >
                ×
              </button>
            </div>
            
            {/* Imagen ampliada */}
            <div className="flex-1 flex items-center justify-center">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title || 'Foto de Corea'}
                className="max-w-full max-h-full object-contain rounded-lg"
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
              Esta acción eliminará la foto para TODOS los dispositivos. ¿Estás seguro?
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

export default SharedKoreaGallery;