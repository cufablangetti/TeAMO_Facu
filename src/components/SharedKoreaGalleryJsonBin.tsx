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

const SharedKoreaGalleryJsonBin: React.FC<SharedKoreaGalleryProps> = ({ newPhotos }) => {
  const [photos, setPhotos] = useState<KoreaPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<KoreaPhoto | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [error, setError] = useState<string>('');

  // JSONBin configuración - DEBES USAR TUS VALORES REALES
  const JSONBIN_API_KEY = '$2a$10$Nuf7k67YFnYpULzk22ylr.0qsAVr8rYiCFithtpvz6xM/6m7yC.cK';
  const JSONBIN_BIN_ID = '68c75c3b43b1c97be9431120';

  // Función para cargar fotos desde JSONBin
  const loadSharedPhotos = async () => {
    // Verificar configuración
    if (JSONBIN_API_KEY.includes('REEMPLAZA') || JSONBIN_BIN_ID.includes('REEMPLAZA')) {
      setError('JSONBin no está configurado correctamente');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Usar el endpoint /latest para obtener la versión más reciente
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
        
        setPhotos(uniquePhotos);
        setLastRefresh(new Date().toLocaleTimeString('es-ES'));
      } else if (response.status === 404) {
        // El bin no existe todavía
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
      
      // Mostrar solo fotos nuevas en caso de error
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
      // Filtrar la foto del estado local
      const updatedPhotos = photos.filter(photo => photo.url !== photoUrl);
      setPhotos(updatedPhotos);
      
      // Actualizar en JSONBin si está configurado
      if (!JSONBIN_API_KEY.includes('REEMPLAZA') && !JSONBIN_BIN_ID.includes('REEMPLAZA')) {
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
      }
      
      // Cerrar confirmación y modal
      setShowDeleteConfirm(null);
      if (selectedPhoto?.url === photoUrl) {
        setSelectedPhoto(null);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      // Recargar en caso de error
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
          <p className="text-gray-600">Sincronizando desde JSONBin...</p>
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
          Cada foto se guarda en ImgBB y se sincroniza automáticamente vía JSONBin.
        </p>
        
        {/* Error de configuración */}
        {error && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg max-w-md mx-auto">
            <p className="text-orange-800 font-medium text-sm">⚠️ {error}</p>
            {error.includes('configurado') && (
              <div className="mt-2 text-xs text-orange-600">
                <p>Para sincronizar entre dispositivos:</p>
                <p>1. Ve a jsonbin.io y crea una cuenta</p>
                <p>2. Crea un bin nuevo</p>
                <p>3. Configura API Key y Bin ID en el código</p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="text-sm text-blue-600 font-medium">
            {photos.length} foto{photos.length !== 1 ? 's' : ''} compartida{photos.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
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
          <div className="bg-blue-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <MapPin className="text-blue-600" size={36} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No hay fotos aún</h3>
          <p className="text-gray-600 mb-4">
            ¡Sube las primeras fotos del viaje para que aparezcan en todos los dispositivos!
          </p>
          <button
            onClick={handleRefresh}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={16} />
            Buscar fotos
          </button>
        </div>
      )}

      {/* Galería de fotos */}
      {photos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div
              key={`${photo.uploadedAt}-${index}`}
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
                      parent.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><span class="text-gray-500 text-xs">Error al cargar</span></div>';
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
                className="text-white hover:text-gray-300 text-3xl font-light"
              >
                ×
              </button>
            </div>
            
            {/* Imagen ampliada */}
            <div className="flex-1 flex items-center justify-center">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title || 'Foto de Corea'}
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
              Esta foto se eliminará para TODOS los dispositivos. ¿Estás seguro?
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

export default SharedKoreaGalleryJsonBin;