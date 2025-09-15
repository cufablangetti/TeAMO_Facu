import React, { useState } from 'react';
import { Upload, Lock, X, Check, AlertCircle } from 'lucide-react';

interface PhotoUploadProps {
  onPhotosUploaded: (photos: { url: string; title: string; uploadedAt: string }[]) => void;
}

const PhotoUploadJsonBin: React.FC<PhotoUploadProps> = ({ onPhotosUploaded }) => {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: number]: number}>({});

  // Contraseña
  const UPLOAD_PASSWORD = 'coti2025';
  
  // JSONBin configuración - DEBES REEMPLAZAR ESTOS VALORES
  const JSONBIN_API_KEY = '$2a$10$Nuf7k67YFnYpULzk22ylr.0qsAVr8rYiCFithtpvz6xM/6m7yC.cK';
  const JSONBIN_BIN_ID = '68c75c3b43b1c97be9431120';

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
    const limitedFiles = imageFiles.slice(0, 5); // Máximo 5 fotos
    
    setSelectedFiles(limitedFiles);
    
    // Crear previews
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

  // Convertir archivo a base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Obtener fotos existentes de JSONBin
  const getExistingPhotos = async () => {
    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
        headers: {
          'X-Master-Key': JSONBIN_API_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.record?.photos || [];
      } else if (response.status === 404) {
        // El bin no existe, crearlo
        return [];
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error obteniendo fotos existentes:', error);
      throw error;
    }
  };

  // Guardar fotos en JSONBin
  const savePhotosToJsonBin = async (allPhotos: any[]) => {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
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

    if (!response.ok) {
      throw new Error(`Error guardando: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    // Validar configuración
    if (JSONBIN_API_KEY.includes('REEMPLAZA') || JSONBIN_BIN_ID.includes('REEMPLAZA')) {
      setError('Debes configurar JSONBIN_API_KEY y JSONBIN_BIN_ID en el código');
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      // Convertir archivos a base64
      const convertedPhotos = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress(prev => ({ ...prev, [i]: 25 }));
        
        const base64 = await fileToBase64(file);
        setUploadProgress(prev => ({ ...prev, [i]: 75 }));
        
        convertedPhotos.push({
          url: base64,
          title: file.name,
          uploadedAt: new Date().toISOString()
        });
        
        setUploadProgress(prev => ({ ...prev, [i]: 100 }));
      }
      
      // Obtener fotos existentes
      const existingPhotos = await getExistingPhotos();
      
      // Combinar fotos
      const allPhotos = [...existingPhotos, ...convertedPhotos];
      
      // Guardar en JSONBin
      await savePhotosToJsonBin(allPhotos);
      
      // Notificar al componente padre
      onPhotosUploaded(convertedPhotos);
      
      // Limpiar formulario
      setSelectedFiles([]);
      setPreviews([]);
      setShowModal(false);
      setIsAuthenticated(false);
      setPassword('');
      setUploadProgress({});
      
    } catch (error) {
      console.error('Error al subir fotos:', error);
      setError(`Error: ${error.message}`);
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

              {/* Configuración requerida */}
              {(JSONBIN_API_KEY.includes('REEMPLAZA') || JSONBIN_BIN_ID.includes('REEMPLAZA')) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-medium text-sm">⚠️ Configuración requerida</p>
                  <p className="text-red-600 text-xs mt-1">
                    Necesitas configurar JSONBIN_API_KEY y JSONBIN_BIN_ID en el código
                  </p>
                  <div className="mt-2 text-xs text-red-600">
                    <p>1. Ve a jsonbin.io y regístrate</p>
                    <p>2. Crea un bin nuevo</p>
                    <p>3. Copia tu API Key y Bin ID</p>
                    <p>4. Reemplaza en el código</p>
                  </div>
                </div>
              )}

              {/* Autenticación */}
              {!isAuthenticated ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <Lock size={20} />
                    <span>Ingresa la contraseña para subir fotos</span>
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
                    <p className="text-blue-800 font-medium">📱 Sincronización automática</p>
                    <p className="text-blue-600 text-xs mt-1">
                      Las fotos se guardan en JSONBin y aparecen en todos los dispositivos
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
                      <span className="text-gray-600">Selecciona fotos del viaje</span>
                      <span className="text-sm text-gray-500">Máximo 5 imágenes</span>
                    </label>
                  </div>

                  {/* Previsualizaciones */}
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
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded">
                      <AlertCircle size={16} />
                      <span>{error}</span>
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
                        Subiendo a JSONBin...
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        Compartir {selectedFiles.length} foto{selectedFiles.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Las fotos se guardan como base64 en JSONBin y se sincronizan automáticamente
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

export default PhotoUploadJsonBin;