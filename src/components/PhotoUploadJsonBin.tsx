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
  
  // ImgBB API Key - REEMPLAZA CON TU API KEY DE IMGBB
  const IMGBB_API_KEY = 'c76cf58613a488c3b14fee596a71898a';
  
  // JSONBin configuración - DEBES USAR TUS VALORES REALES
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

  // Subir imagen a ImgBB
  const uploadToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`ImgBB upload failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error('ImgBB upload failed');
    }

    return data.data.url;
  };

  // Obtener fotos existentes de JSONBin
  const getExistingPhotos = async () => {
    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
        method: 'GET',
        headers: {
          'X-Master-Key': JSONBIN_API_KEY,
          'X-Access-Key': '$2a$10$Nuf7k67YFnYpULzk22ylr.0qsAVr8rYiCFithtpvz6xM/6m7yC.cK',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.record?.photos || [];
      } else if (response.status === 404) {
        // El bin no existe, se creará automáticamente
        return [];
      } else {
        console.error('Error response:', response.status, response.statusText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error obteniendo fotos existentes:', error);
      return []; // Devolver array vacío en caso de error
    }
  };

  // Crear o actualizar el bin en JSONBin
  const savePhotosToJsonBin = async (allPhotos: any[]) => {
    try {
      // Primero intentar crear el bin
      let response = await fetch(`https://api.jsonbin.io/v3/b`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_API_KEY,
          'X-Bin-Name': 'korea-photos',
          'X-Collection-Id': '$2a$10$Nuf7k67YFnYpULzk22ylr.0qsAVr8rYiCFithtpvz6xM/6m7yC.cK',
        },
        body: JSON.stringify({
          photos: allPhotos,
          lastUpdated: new Date().toISOString()
        }),
      });

      // Si el bin ya existe (409), actualizarlo
      if (response.status === 409 || !response.ok) {
        response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
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
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('JSONBin error:', response.status, errorText);
        throw new Error(`Error guardando: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en savePhotosToJsonBin:', error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    // Validar configuración
    if (IMGBB_API_KEY.includes('REEMPLAZA')) {
      setError('Debes configurar IMGBB_API_KEY en el código');
      return;
    }
    
    if (JSONBIN_API_KEY.includes('REEMPLAZA') || JSONBIN_BIN_ID.includes('REEMPLAZA')) {
      setError('Debes configurar JSONBIN_API_KEY y JSONBIN_BIN_ID en el código');
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      // Subir archivos a ImgBB
      const uploadedPhotos = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress(prev => ({ ...prev, [i]: 25 }));
        
        // Subir a ImgBB
        const imageUrl = await uploadToImgBB(file);
        setUploadProgress(prev => ({ ...prev, [i]: 75 }));
        
        uploadedPhotos.push({
          url: imageUrl,
          title: file.name,
          uploadedAt: new Date().toISOString()
        });
        
        setUploadProgress(prev => ({ ...prev, [i]: 100 }));
      }
      
      // Obtener fotos existentes de JSONBin
      const existingPhotos = await getExistingPhotos();
      
      // Combinar fotos (evitar duplicados por URL)
      const allPhotos = [...existingPhotos];
      uploadedPhotos.forEach(newPhoto => {
        const exists = allPhotos.some(existing => existing.url === newPhoto.url);
        if (!exists) {
          allPhotos.push(newPhoto);
        }
      });
      
      // Guardar en JSONBin
      await savePhotosToJsonBin(allPhotos);
      
      // Notificar al componente padre
      onPhotosUploaded(uploadedPhotos);
      
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
              {(IMGBB_API_KEY.includes('REEMPLAZA') || JSONBIN_API_KEY.includes('REEMPLAZA') || JSONBIN_BIN_ID.includes('REEMPLAZA')) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-medium text-sm">⚠️ Configuración requerida</p>
                  <div className="text-red-600 text-xs mt-1 space-y-1">
                    {IMGBB_API_KEY.includes('REEMPLAZA') && <p>• Configura IMGBB_API_KEY</p>}
                    {(JSONBIN_API_KEY.includes('REEMPLAZA') || JSONBIN_BIN_ID.includes('REEMPLAZA')) && <p>• Configura JSONBin API Key y Bin ID</p>}
                  </div>
                  <div className="mt-2 text-xs text-red-600">
                    <p><strong>ImgBB:</strong> Regístrate en imgbb.com para obtener API key</p>
                    <p><strong>JSONBin:</strong> Regístrate en jsonbin.io para obtener API key y crear bin</p>
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

                  {/* Información del proceso */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <p className="text-blue-800 font-medium">📱 Proceso de subida:</p>
                    <p className="text-blue-600 text-xs mt-1">
                      1. Fotos → ImgBB (hosting)<br/>
                      2. URLs → JSONBin (sincronización)<br/>
                      3. Disponible en todos los dispositivos
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
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        Compartir {selectedFiles.length} foto{selectedFiles.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Fotos → ImgBB → JSONBin → Sincronización automática
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