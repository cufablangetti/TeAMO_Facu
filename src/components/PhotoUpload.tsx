import React, { useState } from 'react';
import { Upload, Lock, X, Check, AlertCircle } from 'lucide-react';

interface PhotoUploadProps {
  onPhotosUploaded: (photos: string[]) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotosUploaded }) => {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Contraseña hardcodeada
  const UPLOAD_PASSWORD = 'coti2025';

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
    
    // Filtrar solo imágenes y limitar a 5 fotos
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const limitedFiles = imageFiles.slice(0, 5);
    
    setSelectedFiles(limitedFiles);
    
    // Crear previsualizaciones
    const newPreviews = limitedFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    // Liberar URL del preview eliminado
    URL.revokeObjectURL(previews[index]);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    
    try {
      // Simular proceso de subida
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Convertir archivos a base64 para almacenamiento local
      const base64Images = await Promise.all(
        selectedFiles.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        })
      );
      
      // Guardar en localStorage (en un entorno real, esto sería una API)
      const existingPhotos = JSON.parse(localStorage.getItem('userUploadedPhotos') || '[]');
      const newPhotos = [...existingPhotos, ...base64Images];
      localStorage.setItem('userUploadedPhotos', JSON.stringify(newPhotos));
      
      // Notificar al componente padre
      onPhotosUploaded(base64Images);
      
      // Limpiar formulario
      setSelectedFiles([]);
      setPreviews([]);
      setShowModal(false);
      setIsAuthenticated(false);
      setPassword('');
      
    } catch (error) {
      setError('Error al subir las fotos. Inténtalo de nuevo.');
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
  };

  return (
    <>
      {/* Botón para abrir modal */}
      <button
        onClick={() => setShowModal(true)}
        className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        <Upload size={20} />
        Subir Fotos
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {!isAuthenticated ? 'Acceso Requerido' : 'Subir Fotos'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
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
                    <span>Acceso autorizado</span>
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
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="text-gray-400" size={48} />
                      <span className="text-gray-600">
                        Haz clic para seleccionar fotos
                      </span>
                      <span className="text-sm text-gray-500">
                        Máximo 5 imágenes
                      </span>
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
                            <button
                              onClick={() => removeFile(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
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
                        Subir {selectedFiles.length} foto{selectedFiles.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoUpload;