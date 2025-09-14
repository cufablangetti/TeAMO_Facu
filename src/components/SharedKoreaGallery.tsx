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

  // Fotos de ejemplo de Corea para mostrar inicialmente
  const defaultPhotos: KoreaPhoto[] = [
    {
      url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      title: "Palacio Gyeongbokgung",
      uploadedAt: "2024-01-15T10:30:00Z"
    },
    {
      url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop",
      title: "Torre Namsan",
      uploadedAt: "2024-01-15T14:20:00Z"
    },
    {
      url: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop",
      title: "Barrio Bukchon Hanok",
      uploadedAt: "2024-01-16T09:15:00Z"
    },
    {
      url: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&h=600&fit=crop",
      title: "Mercado Myeongdong",
      uploadedAt: "2024-01-16T18:45:00Z"
    }
  ];

  // Cargar fotos (combinar fotos por defecto con nuevas fotos)
  const loadPhotos = () => {
    setLoading(true);
    
    // Simular carga
    setTimeout(() => {
      // Combinar fotos por defecto con nuevas fotos
      const allPhotos = [...defaultPhotos, ...newPhotos];
      
      // Eliminar duplicados basándose en la URL
      const uniquePhotos = allPhotos.filter((photo, index, self) => 
        index === self.findIndex(p => p.url === photo.url)
      );
      
      setPhotos(uniquePhotos);
      setLastRefresh(new Date().toLocaleTimeString());
      setLoading(false);
    }, 1000);
  };

  // Cargar fotos al montar el componente y cuando lleguen nuevas fotos
  useEffect(() => {
    loadPhotos();
  }, [newPhotos]);

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
      
      // Cerrar confirmación
      setShowDeleteConfirm(null);
      
      // Cerrar modal si la foto eliminada estaba seleccionada
      if (selectedPhoto?.url === photoUrl) {
        setSelectedPhoto(null);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const openPhotoModal = (photo: KoreaPhoto) => {
    setSelectedPhoto(photo);
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  const handleRefresh = () => {
    loadPhotos();
  };

  if (loading) {
    return (
      <div className="korea-photos-gallery bg-gradient-to-br from-blue-50 to-pink-50 rounded-xl p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <h3 className="text-2xl font-bold text-gray-800">Cargando fotos de Corea...</h3>
          <p className="text-gray-600">Preparando la galería</p>
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
          Cada foto cuenta una historia especial de esta aventura.
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
        {newPhotos.length > 0 && (
          <div className="mt-2 text-sm text-green-600 bg-green-50 rounded-full px-4 py-1 inline-block">
            ¡{newPhotos.length} nueva{newPhotos.length > 1 ? 's' : ''} foto{newPhotos.length > 1 ? 's' : ''} añadida{newPhotos.length > 1 ? 's' : ''}!
          </div>
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
                    parent.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><span class="text-gray-500 text-sm">Error al cargar</span></div>';
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
              Esta foto se eliminará de la galería. ¿Estás seguro?
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