'use client';
import { useAuth } from '../../../../context/AuthContext';
import { useEffect, useState } from 'react';
import { Upload, FileText, Archive, X, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '../../../../components/panel-estudiante/Header';
import { subirDocumento } from '@/services/documentos'
interface Document {
  id: string;
  nombre: string;
  tipo: string;
  fecha_subida: string;
  tamaño: string;
}

const EstudianteConGrupoPage = () => {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState<'subir' | 'ver' | 'historial'>('subir');
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // ← Cambiado a single file
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle'); // ← Nuevo estado
  const [uploadMessage, setUploadMessage] = useState(''); // ← Nuevo estado
  const [proyectoId] = useState(1); // ← ID del proyecto (cambia por el real)

  // Cargar datos del usuario y documentos
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        if (!user) {
          await login();
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!user) {
          console.error('No se pudo cargar el usuario');
          return;
        }

        // Mock data por ahora, después puedes usar una función para obtener documentos reales
        const mockDocuments: Document[] = [
          {
            id: '1',
            nombre: 'Informe Final Proyecto.pdf',
            tipo: 'PDF',
            fecha_subida: '2025-09-15 14:30',
            tamaño: '2.4 MB'
          },
          {
            id: '2',
            nombre: 'Presentacion.pptx',
            tipo: 'PPTX',
            fecha_subida: '2025-09-10 09:15',
            tamaño: '1.8 MB'
          }
        ];
        setDocuments(mockDocuments);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, login]);

  // ← FUNCIÓN PARA SELECCIONAR ARCHIVO PDF
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      // Validación inmediata: SOLO PDF
      if (file.type !== 'application/pdf') {
        setUploadStatus('error');
        setUploadMessage(`${file.name} no es un archivo PDF válido`);
        setSelectedFile(null);
        return;
      }
      
      // Validación de tamaño: máximo 10MB
      if (file.size > 10 * 1024 * 1024) {
        setUploadStatus('error');
        setUploadMessage(`${file.name} excede el tamaño máximo de 10MB`);
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setUploadStatus('idle');
      setUploadMessage('');
    }
  };

  // ← FUNCIÓN PARA SUBIR EL PDF USANDO EL SERVICE
  const handleUploadDocuments = async () => {
    if (!selectedFile || !user) {
      setUploadStatus('error');
      setUploadMessage('Selecciona un archivo PDF y asegúrate de estar logueado');
      return;
    }

    // Validación final
    if (selectedFile.type !== 'application/pdf') {
      setUploadStatus('error');
      setUploadMessage('Solo se permiten archivos PDF');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadStatus('error');
      setUploadMessage('El archivo excede el tamaño máximo de 10MB');
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadMessage('Subiendo PDF...');

    try {
      // ← LLAMAR AL MÉTODO DEL SERVICE
      const result = await subirDocumento(selectedFile, proyectoId, selectedFile.name);

      if (result.success) {
        setUploadStatus('success');
        setUploadMessage(`¡PDF subido correctamente! ID: ${result.codigoDoc}`);
        setSelectedFile(null);
        
        // Limpiar input file
        const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        // Opcional: recargar lista de documentos si tienes la función
        // setDocuments(await obtenerDocumentos(proyectoId));
      } else {
        setUploadStatus('error');
        setUploadMessage(`Error al subir: ${result.error}`);
      }
    } catch (error) {
      console.error('Error en handleUploadDocuments:', error);
      setUploadStatus('error');
      setUploadMessage('Error de conexión al subir el PDF');
    } finally {
      setIsUploading(false);
    }
  };

  // ← FUNCIÓN PARA LIMPIAR EL ESTADO
  const clearUpload = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setUploadMessage('');
    // Limpiar input file
    const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const removeFile = () => {
    clearUpload();
  };

  if (isLoading) {
    return (
      <div className="proyecto-page">
        <Header user={null} grupo_id="1" proyecto_id="1" />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando panel del estudiante...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="proyecto-page">
        <Header user={null} grupo_id="1" proyecto_id="1" />
        <div className="no-user-container">
          <div className="no-user-content">
            <h2 className="no-user-title">Acceso Denegado</h2>
            <p className="no-user-message">
              No tienes permisos para acceder a esta página. 
              <br />
              <a href="/auth/signin" className="error-button">Iniciar Sesión</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="proyecto-page">
      {/* Header */}
      <Header 
        user={user} 
        grupo_id={user.grupo_id} 
        proyecto_id="1" 
      />

      {/* Main Content */}
      <main className="proyecto-main">
        <div className="proyecto-content">
          {/* Título de la página */}
          <div className="content-header">
            <div>
              <h1 className="content-title">Proyecto #1</h1>
              <p className="content-subtitle">Gestiona tus documentos PDF del proyecto</p>
            </div>
          </div>

          {/* Botones de Navegación */}
          <nav className="nav-buttons">
            <button
              onClick={() => setActiveTab('subir')}
              className={`nav-button ${activeTab === 'subir' ? 'nav-button--active' : ''}`}
            >
              <Upload size={18} />
              <span>Subir PDF</span>
            </button>

            <button
              onClick={() => setActiveTab('ver')}
              className={`nav-button ${activeTab === 'ver' ? 'nav-button--active' : ''}`}
            >
              <FileText size={18} />
              <span>Ver documentos</span>
            </button>

            <button
              onClick={() => setActiveTab('historial')}
              className={`nav-button ${activeTab === 'historial' ? 'nav-button--active' : ''}`}
            >
              <Archive size={18} />
              <span>Historial</span>
            </button>
          </nav>

          {/* Contenido de las pestañas */}
          <section className="document-card">
            {activeTab === 'subir' && (
              <div>
                <h2 className="content-title" style={{marginBottom: '1.5rem'}}>Subir Documento PDF</h2>
                
                {/* Información de requisitos - SOLO PDF */}
                <div className="estudiante-card" style={{marginBottom: '1.5rem', background: '#f8f9ff', padding: '1rem'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                    <AlertCircle size={20} style={{color: '#5b88a5'}} />
                    <span style={{fontWeight: '500', color: '#243a69'}}>Requisitos:</span>
                  </div>
                  <ul style={{color: '#5b88a5', fontSize: '0.875rem', margin: '0.5rem 0 0 1.5rem'}}>
                    <li><strong>Solo archivos PDF</strong></li>
                    <li>Máximo 10MB por archivo</li>
                    <li>1 archivo por subida</li>
                  </ul>
                </div>

                {/* Área de carga - SOLO PDF */}
                <div className="upload-area" style={{padding: '2rem', border: '2px dashed #9bc7e8', cursor: 'pointer'}}>
                  <Upload size={48} style={{color: '#5b88a5', margin: '0 auto 1rem', display: 'block'}} />
                  <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#243a69', marginBottom: '0.5rem'}}>
                    Arrastra tu archivo PDF aquí
                  </h3>
                  <p style={{color: '#5b88a5', marginBottom: '1.5rem'}}>
                    o haz clic para seleccionar un PDF
                  </p>
                  
                  <input
                    id="pdf-upload"
                    type="file"
                    accept="application/pdf" // ← Solo PDF
                    onChange={handleFileSelect}
                    className="file-input"
                    style={{display: 'none'}}
                  />
                  <label 
                    htmlFor="pdf-upload" 
                    className="submit-button" 
                    style={{display: 'inline-block', padding: '0.75rem 1.5rem', fontSize: '0.9rem', marginTop: '1rem'}}
                  >
                    <FileText size={16} style={{marginRight: '0.5rem', display: 'inline'}} />
                    Seleccionar PDF
                  </label>
                </div>

                {/* Vista previa del PDF seleccionado */}
                {selectedFile && (
                  <div className="files-preview" style={{marginTop: '1.5rem'}}>
                    <h3 className="files-preview-title" style={{fontSize: '0.875rem', fontWeight: '600', color: '#243a69', marginBottom: '0.75rem'}}>
                      PDF seleccionado:
                    </h3>
                    <div className="file-item">
                      <div className="file-info">
                        <div className="file-icon">
                          <CheckCircle size={20} style={{color: '#10b981'}} />
                        </div>
                        <div className="file-details">
                          <p className="file-name" title={selectedFile.name}>{selectedFile.name}</p>
                          <p className="file-size">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeFile}
                        className="file-remove"
                        title="Eliminar archivo"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Botón de subir PDF */}
                {selectedFile && uploadStatus === 'idle' && (
                  <div className="text-right" style={{marginTop: '1.5rem'}}>
                    <button
                      onClick={handleUploadDocuments}
                      disabled={isUploading}
                      className="upload-button"
                      style={{padding: '0.75rem 1.5rem', fontSize: '0.9rem'}}
                    >
                      Subir PDF
                    </button>
                  </div>
                )}

                {/* Estado de subida */}
                {uploadStatus !== 'idle' && (
                  <div className="files-preview" style={{marginTop: '1.5rem'}}>
                    <h3 className="files-preview-title">Estado de la subida:</h3>
                    <div className="file-item">
                      <div className="file-info">
                        <div className="file-icon">
                          {uploadStatus === 'uploading' && (
                            <div style={{
                              width: '20px', height: '20px', 
                              border: '2px solid #e5e7eb', borderTop: '2px solid #5b88a5',
                              borderRadius: '50%', animation: 'spin 1s linear infinite',
                              display: 'inline-block'
                            }}></div>
                          )}
                          {uploadStatus === 'success' && <CheckCircle size={20} style={{color: '#10b981'}} />}
                          {uploadStatus === 'error' && <AlertCircle size={20} style={{color: '#ef4444'}} />}
                        </div>
                        <div className="file-details">
                          <p className="file-name">{uploadMessage}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ver' && (
              <div>
                <h2 className="content-title" style={{marginBottom: '1.5rem'}}>Documentos del Proyecto</h2>
                
                {documents.length === 0 ? (
                  <div className="empty-state">
                    <FileText size={64} className="empty-icon" style={{color: '#d4cdc5'}} />
                    <h3 className="empty-title">No hay documentos</h3>
                    <p className="empty-description">
                      Sube tus primeros documentos PDF para comenzar a trabajar en el proyecto.
                    </p>
                    <button
                      onClick={() => setActiveTab('subir')}
                      className="submit-button"
                      style={{padding: '0.75rem 1.5rem', fontSize: '0.9rem'}}
                    >
                      <Upload size={16} style={{marginRight: '0.5rem', display: 'inline'}} />
                      Subir primer PDF
                    </button>
                  </div>
                ) : (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                    {documents.map((doc) => (
                      <div key={doc.id} className="estudiante-card" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', flex: 1}}>
                          <div style={{width: '2.5rem', height: '2.5rem', background: '#deebf7', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <FileText size={20} style={{color: '#445a85'}} />
                          </div>
                          <div style={{flex: 1, minWidth: 0}}>
                            <p className="estudiante-name" style={{fontSize: '0.875rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={doc.nombre}>
                              {doc.nombre}
                            </p>
                            <div style={{display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#5b88a5', marginTop: '0.25rem'}}>
                              <span>Tipo: {doc.tipo}</span>
                              <span>{doc.tamaño}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                          <button className="submit-button" style={{width: '2.25rem', height: '2.25rem', padding: '0', fontSize: '0.75rem', borderRadius: '0.375rem', background: '#deebf7', color: '#445a85'}} title="Ver documento">
                            <svg style={{width: '1rem', height: '1rem'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button className="submit-button" style={{width: '2.25rem', height: '2.25rem', padding: '0', fontSize: '0.75rem', borderRadius: '0.375rem', background: '#dcfce7', color: '#166534'}} title="Descargar">
                            <svg style={{width: '1rem', height: '1rem'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          <button style={{width: '2.25rem', height: '2.25rem', padding: '0', fontSize: '0.75rem', borderRadius: '0.375rem', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer'}} title="Eliminar">
                            <svg style={{width: '1rem', height: '1rem'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'historial' && (
              <div>
                <h2 className="content-title" style={{marginBottom: '1.5rem'}}>Historial de Actividades</h2>
                
                {documents.length === 0 ? (
                  <div className="empty-state">
                    <Archive size={64} className="empty-icon" style={{color: '#d4cdc5'}} />
                    <h3 className="empty-title">No hay historial</h3>
                    <p className="empty-description">
                      Sube tus primeros documentos PDF para ver el historial de actividades.
                    </p>
                    <button
                      onClick={() => setActiveTab('subir')}
                      className="submit-button"
                      style={{padding: '0.75rem 1.5rem', fontSize: '0.9rem'}}
                    >
                      <Upload size={16} style={{marginRight: '0.5rem', display: 'inline'}} />
                      Subir primer PDF
                    </button>
                  </div>
                ) : (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                    {documents.map((doc, index) => (
                      <div key={index} className="estudiante-card" style={{display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.5rem'}}>
                        <div style={{width: '2.5rem', height: '2.5rem', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                          <Upload size={20} style={{color: '#166534'}} />
                        </div>
                        <div style={{flex: 1, minWidth: 0}}>
                          <p className="estudiante-name" style={{fontSize: '0.875rem', margin: '0 0 0.25rem 0'}}>
                            Subido: <span style={{fontWeight: 'normal'}}>"{doc.nombre}"</span>
                          </p>
                          <div style={{display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#5b88a5', marginBottom: '0.5rem'}}>
                            <span>Tamaño: {doc.tamaño}</span>
                            <span>Tipo: {doc.tipo}</span>
                          </div>
                          <span style={{display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.5rem', background: '#dcfce7', color: '#166534', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500'}}>
                            Exitoso
                          </span>
                        </div>
                        <div style={{textAlign: 'right', flexShrink: 0, fontWeight: '500', color: '#243a69', fontSize: '0.875rem'}}>
                          {new Date(doc.fecha_subida).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default EstudianteConGrupoPage;