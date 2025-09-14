import React, { useState } from 'react';
import { Upload, Lock, X, Check, AlertCircle } from 'lucide-react';

interface PhotoUploadProps {
  onPhotosUploaded: (photos: { url: string; title: string; uploadedAt: string }[]) => void;
}

const PhotoUploadShared: React.FC<PhotoUploadProps> = ({ onPhotosUploaded }) => {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: number]: number}>({});

  // Contraseña hardcodeada
  const UPLOAD_PASSWORD = 'coti2025';
  
  // API Key de ImgBB - REEMPLAZAR con tu API key real
  const IMGBB_API_KEY = 'c76cf58613a488c3b14fee596a71898a';
  
  // JSONBin para compartir URLs entre dispositivos (gratis)
  const JSONBIN_API_KEY = '$2a$10$VmNP2S.huINnjHhoen6ISu9xr/.rs63Igu70nrX8/VY5WMoVoqh/m';
  const JSONBIN_BIN_ID = '68c74cbdae596e708feec53f';

  const handlePasswordSubmit = () => {
    if (password === UPLOAD_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const limitedFiles = imageFiles.slice(0, 3);
    
    setSelectedFiles(limitedFiles);
    
    const newPreviews = limitedFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
    setUploadProgress({});
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    URL.revokeObjectURL(previews[index]);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const uploadToImgBB = async (file: File, index: number): Promise<{url: string; title: string}> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', IMGBB_API_KEY);
    formData.append('name', `corea-viaje-${Date.now()}-${index}`);

    try {
      setUploadProgress(prev => ({ ...prev, [index]: 0 }));
      
      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(prev => ({ ...prev, [index]: 50 }));

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      setUploadProgress(prev => ({ ...prev, [index]: 100 }));

      if (data.success) {
        return {
          url: data.data.url,
          title: data.data.title || file.name
        };
      } else {
        throw new Error(data.error?.message || 'Error al subir imagen');
      }
    } catch (error) {
      setUploadProgress(prev => ({ ...prev, [index]: -1 }));
      throw error;
    }
  };

  // Función para guardar URLs en servicio compartido
  const saveToSharedService = async (newPhotos: any[]) => {
    try {
      // Obtener fotos existentes
      const existingResponse = await fetch('https://api.jsonbin.io/v3/b/korea-photos-shared', {
        headers: {
          'X-Master-Key': JSONBIN_API_KEY,
        },
      });

      let existingPhotos = [];
      if (existingResponse.ok) {
        const existingData = await existingResponse.json();
        existingPhotos = existingData.record?.photos || [];
      }

      // Combinar con nuevas fotos
      const allPhotos = [...existingPhotos, ...newPhotos];

      // Guardar en JSONBin
      await fetch('https://api.jsonbin.io/v3/b/korea-photos-shared', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_API_KEY,
        },
        body: JSON.stringify({
          photos: allPhotos,
          lastUpdated: new Date().toISOString()
        }),
      });

    } catch (error) {
      console.error('Error saving to shared service:', error);
      // Fallback a localStorage
      const existingPhotos = JSON.parse(localStorage.getItem('koreaPhotos') || '[]');
      const updatedPhotos = [...existingPhotos, ...newPhotos];
      localStorage.setItem('koreaPhotos', JSON.stringify(updatedPhotos));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    setError('');
    
    try {
      // Subir todas las imágenes a ImgBB
      const uploadPromises = selectedFiles.map((file, index) => 
        uploadToImgBB(file, index)
      );
      
      const uploadedPhotos = await Promise.all(uploadPromises);
      
      // Agregar timestamp
      const photosWithTimestamp = uploadedPhotos.map(photo => ({
        ...photo,
        uploadedAt: new Date().toISOString()
      }));
      
      // Guardar en servicio compartido
      await saveToSharedService(photosWithTimestamp);
      
      // Notificar al componente padre
      onPhotosUploaded(photosWithTimestamp);
      
      // Limpiar formulario
      setSelectedFiles([]);
      setPreviews([]);
      setShowModal(false);
      setIsAuthenticated(false);
      setPassword('');
      setUploadProgress({});
      
    } catch (error) {
      console.error('Error al subir fotos:', error);
      setError(`Error al subir las fotos: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsAuthenticated(false);
    setPassword('');
    setError('');
    setSelectedFiles([]);
    setPreviews([]);
    setUploadProgress({});
  };

  return (
    <>
      {/* Botón para abrir modal */}
      <button
        onClick={() => setShowModal(true)}
        className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        <Upload size={20} />
        Subir Fotos del Viaje
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {!isAuthenticated ? 'Acceso Requerido' : 'Subir Fotos de Corea'}
                </h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              {/* Autenticación */}
              {!isAuthenticated ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <Lock size={20} />
                    <span>Ingresa la contraseña para subir fotos del viaje</span>
                  </div>
                  
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  />
                  
                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}
                  
                  <button
                    onClick={handlePasswordSubmit}
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg transition-colors"
                  >
                    Ingresar
                  </button>
                </div>
              ) : (
                /* Subida de fotos */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 mb-4">
                    <Check size={20} />
                    <span>¡Listo para compartir momentos de Corea!</span>
                  </div>

                  {/* Información importante */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <p className="text-blue-800 font-medium">📱 Las fotos se comparten automáticamente</p>
                    <p className="text-blue-600 text-xs mt-1">
                      Una vez subidas, aparecerán en todos los dispositivos
                    </p>
                  </div>

                  {/* Selector de archivos */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="file-upload"
                      className={`cursor-pointer flex flex-col items-center gap-2 ${uploading ? 'opacity-50' : ''}`}
                    >
                      <Upload className="text-gray-400" size={48} />
                      <span className="text-gray-600">Selecciona fotos del viaje a Corea</span>
                      <span className="text-sm text-gray-500">Máximo 3 imágenes</span>
                    </label>
                  </div>

                  {/* Previsualizaciones con progreso */}
                  {previews.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-gray-700">Fotos seleccionadas:</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {previews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            {!uploading && (
                              <button
                                onClick={() => removeFile(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X size={16} />
                              </button>
                            )}
                            {uploadProgress[index] !== undefined && uploadProgress[index] >= 0 && (
                              <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-50 rounded">
                                <div 
                                  className="bg-green-500 h-1 rounded transition-all duration-300"
                                  style={{ width: `${uploadProgress[index]}%` }}
                                />
                              </div>
                            )}
                            {uploadProgress[index] === -1 && (
                              <div className="absolute inset-0 bg-red-500 bg-opacity-50 flex items-center justify-center rounded-lg">
                                <span className="text-white text-xs">Error</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}

                  {/* Botón de subir */}
                  <button
                    onClick={handleUpload}
                    disabled={selectedFiles.length === 0 || uploading}
                    className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Subiendo y compartiendo...
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        Compartir {selectedFiles.length} foto{selectedFiles.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Las fotos se suben a ImgBB y se comparten automáticamente entre todos los dispositivos
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoUploadShared;