import React, { useState } from 'react';
import { Upload, Lock, X, Check, AlertCircle, MessageCircle } from 'lucide-react';

interface PhotoWithComment {
  url: string;
  title: string;
  comment: string;
  uploadedAt: string;
}

interface PhotoUploadWithCommentsProps {
  onPhotosUploaded: (photos: PhotoWithComment[]) => void;
}

const PhotoUploadWithComments: React.FC<PhotoUploadWithCommentsProps> = ({ onPhotosUploaded }) => {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [comments, setComments] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: number]: number}>({});

  // Contraseña
  const UPLOAD_PASSWORD = 'coti2025';
  
  // ImgBB API Key
  const IMGBB_API_KEY = 'c76cf58613a488c3b14fee596a71898a';
  
  // JSONBin configuración - Nuevo bin para fotos con comentarios
  const JSONBIN_API_KEY = '$2a$10$Nuf7k67YFnYpULzk22ylr.0qsAVr8rYiCFithtpvz6xM/6m7yC.cK';
  const JSONBIN_BIN_ID = '68caf72b43b1c97be9465daf'; // Diferente bin para fotos con comentarios

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
    
    // Crear previews y comentarios vacíos
    const newPreviews = limitedFiles.map(file => URL.createObjectURL(file));
    const newComments = limitedFiles.map(() => '');
    
    setPreviews(newPreviews);
    setComments(newComments);
    setUploadProgress({});
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    const newComments = comments.filter((_, i) => i !== index);
    
    URL.revokeObjectURL(previews[index]);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    setComments(newComments);
  };

  const updateComment = (index: number, comment: string) => {
    const newComments = [...comments];
    newComments[index] = comment;
    setComments(newComments);
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
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.record?.photos || [];
      } else if (response.status === 404) {
        return [];
      } else {
        console.error('Error response:', response.status, response.statusText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error obteniendo fotos existentes:', error);
      return [];
    }
  };

  // Crear o actualizar el bin en JSONBin
  const savePhotosToJsonBin = async (allPhotos: PhotoWithComment[]) => {
    try {
      let response = await fetch(`https://api.jsonbin.io/v3/b`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_API_KEY,
          'X-Bin-Name': 'photos-with-comments',
        },
        body: JSON.stringify({
          photos: allPhotos,
          lastUpdated: new Date().toISOString()
        }),
      });

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
    
    // Validar que todas las fotos tengan comentario
    const hasEmptyComments = comments.some(comment => !comment.trim());
    if (hasEmptyComments) {
      setError('Todas las fotos deben tener un comentario');
      return;
    }
    
    // Validar configuración
    if (IMGBB_API_KEY.includes('REEMPLAZA')) {
      setError('Debes configurar IMGBB_API_KEY en el código');
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      // Subir archivos a ImgBB
      const uploadedPhotos: PhotoWithComment[] = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress(prev => ({ ...prev, [i]: 25 }));
        
        // Subir a ImgBB
        const imageUrl = await uploadToImgBB(file);
        setUploadProgress(prev => ({ ...prev, [i]: 75 }));
        
        uploadedPhotos.push({
          url: imageUrl,
          title: file.name,
          comment: comments[i],
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
      setComments([]);
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
    setComments([]);
    setUploadProgress({});
  };

  return (
    <>
      {/* Botón para abrir modal */}
      <button
        onClick={() => setShowModal(true)}
        className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        <MessageCircle size={20} />
        Subir Fotos con Comentarios
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {!isAuthenticated ? 'Acceso Requerido' : 'Subir Fotos con Comentarios'}
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
                    <span>Ingresa la contraseña para subir fotos</span>
                  </div>
                  
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg transition-colors"
                  >
                    Ingresar
                  </button>
                </div>
              ) : (
                /* Subida de fotos */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 mb-4">
                    <Check size={20} />
                    <span>¡Listo para compartir fotos con comentarios!</span>
                  </div>

                  {/* Información del proceso */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm">
                    <p className="text-purple-800 font-medium">📝 Fotos con comentarios:</p>
                    <p className="text-purple-600 text-xs mt-1">
                      Cada foto debe tener un comentario que describa el momento especial
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
                      id="file-upload-comments"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="file-upload-comments"
                      className={`cursor-pointer flex flex-col items-center gap-2 ${uploading ? 'opacity-50' : ''}`}
                    >
                      <Upload className="text-gray-400" size={48} />
                      <span className="text-gray-600">Selecciona fotos especiales</span>
                      <span className="text-sm text-gray-500">Máximo 5 imágenes</span>
                    </label>
                  </div>

                  {/* Previsualizaciones con comentarios */}
                  {previews.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-700">Fotos y comentarios:</h3>
                      <div className="space-y-4">
                        {previews.map((preview, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex gap-3">
                              <div className="relative flex-shrink-0">
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg"
                                />
                                {!uploading && (
                                  <button
                                    onClick={() => removeFile(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                  >
                                    <X size={12} />
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
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  {selectedFiles[index]?.name}
                                </p>
                                <textarea
                                  value={comments[index]}
                                  onChange={(e) => updateComment(index, e.target.value)}
                                  placeholder="Escribe un comentario sobre esta foto..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                  rows={2}
                                  disabled={uploading}
                                />
                              </div>
                            </div>
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
                    disabled={selectedFiles.length === 0 || uploading || comments.some(c => !c.trim())}
                    className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <MessageCircle size={20} />
                        Compartir {selectedFiles.length} foto{selectedFiles.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Fotos con comentarios → ImgBB → JSONBin → Sincronización automática
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

export default PhotoUploadWithComments;