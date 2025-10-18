'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/userAuthGuard';
import { getStudentProfile, obtenerProyecto } from '@/services/api';
import { subirDocumento, obtenerDocumentos, Document } from '@/services/documentos';
import Header from '@/components/estudiante/Header';
import DocumentList from '@/components/estudiante/DocumentList';
import { Upload, FileText, Archive, X, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './page.module.css';

interface StudentProfile {
  id: number;
  cu: string;
  carrera: string;
  proyecto_id: number | null;
  usuario: {
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
  };
  grupo: {
    id: number;
    nombre: string;
    grado: string;
  } | null;
  proyecto?: {
    id: number;
    titulo: string;
    fase_actual: string;
    grado_actual: string;
  } | null;
}

const EstudianteConGrupoPage = () => {
  const router = useRouter();
  const { user, isLoading: authLoading, isUnauthorized } = useAuthGuard('estudiante');
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'subir' | 'ver' | 'historial'>('subir');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  // Load student profile and project data
  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        setIsLoading(true);
        setError('');

        // Fetch student profile
        const profileData = await getStudentProfile();

        // Fetch project details if a project is assigned
        if (profileData.proyecto_id) {
          try {
            const proyectoData = await obtenerProyecto();
            profileData.proyecto = proyectoData;

            // Fetch documents for the project
            const projectDocuments = await obtenerDocumentos(profileData.proyecto_id, "proyecto");
            setDocuments(projectDocuments);
          } catch (proyectoErr) {
            console.error('Error al obtener proyecto:', proyectoErr);
            // Continue with profile data even if project fetch fails
          }
        }

        setStudentProfile(profileData);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al obtener el perfil del estudiante');
        setIsLoading(false);
      }
    }

    if (user && !authLoading) {
      fetchData();
    }
  }, [user, authLoading]);

  // Handle file selection for PDF
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      // Validate: Only PDF
      if (file.type !== 'application/pdf') {
        setUploadStatus('error');
        setUploadMessage(`${file.name} no es un archivo PDF válido`);
        setSelectedFile(null);
        return;
      }

      // Validate: Max 10MB
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

  // Handle PDF upload
  const handleUploadDocuments = async () => {
    if (!selectedFile || !studentProfile?.proyecto_id) {
      setUploadStatus('error');
      setUploadMessage('Selecciona un archivo PDF y asegúrate de que el proyecto esté cargado');
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadMessage('Subiendo PDF...');

    try {
      const result = await subirDocumento(selectedFile, studentProfile.proyecto_id, selectedFile.name);

      if (result.success && result.id) {
        setUploadStatus('success');
        setUploadMessage(`¡PDF subido correctamente! ID: ${result.id}`);
        setSelectedFile(null);

        // Clear file input
        const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        // Update documents state
        const newDocumento: Document = {
          id: result.id,
          titulo: selectedFile.name,
          version: 1,
          estado: 'pendiente',
          activo: true,
          fase: studentProfile.proyecto?.fase_actual || 'inicial',
          created_at: new Date().toISOString(),
          file: '',
          proyecto_id: studentProfile.proyecto_id,
        };
        setDocuments((prev) => [...prev, newDocumento]);

        // Redirect to new document if more than one document exists
        if (documents.length >= 1) {
          router.push(`/dashboard/estudiante/documentoNuevo/${result.id}`);
        }
      } else {
        setUploadStatus('error');
        setUploadMessage(`Error al subir: ${result.error}`);
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage('Error de conexión al subir el PDF');
    } finally {
      setIsUploading(false);
    }
  };

  // Clear upload state
  const clearUpload = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setUploadMessage('');
    const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Handle document click for navigation
  const handleDocumentClick = (documento: Document) => {
    router.push(`/dashboard/estudiante/documento/${documento.id}`);
  };

  if (authLoading || isLoading) {
    return (
      <div className={styles.proyectoPage}>
        <Header user={null} grupo_id="1" proyecto_id="1" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Cargando panel del estudiante...</p>
        </div>
      </div>
    );
  }

  if (isUnauthorized || !user || !studentProfile) {
    return (
      <div className={styles.proyectoPage}>
        <Header user={null} grupo_id="1" proyecto_id="1" />
        <div className={styles.noUserContainer}>
          <div className={styles.noUserContent}>
            <h2 className={styles.noUserTitle}>Acceso Denegado</h2>
            <p className={styles.noUserMessage}>
              No tienes permisos para acceder a esta página.
              <br />
              <a href="/auth/signin" className={styles.errorButton}>Iniciar Sesión</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.proyectoPage}>
      <Header user={studentProfile.usuario} grupo_id={studentProfile.grupo?.id.toString() || '1'} proyecto_id={studentProfile.proyecto_id?.toString() || '1'} />
      <main className={styles.proyectoMain}>
        <div className={styles.proyectoContent}>
          <div className={styles.contentHeader}>
            <div>
              <h1 className={styles.contentTitle}>Proyecto #{studentProfile.proyecto_id}</h1>
              <p className={styles.contentSubtitle}>Gestiona tus documentos PDF del proyecto</p>
            </div>
          </div>

          <nav className={styles.navButtons}>
            <button
              onClick={() => setActiveTab('subir')}
              className={`${styles.navButton} ${activeTab === 'subir' ? styles.navButtonActive : ''}`}
            >
              <Upload size={18} />
              <span>Subir PDF</span>
            </button>
            <button
              onClick={() => setActiveTab('ver')}
              className={`${styles.navButton} ${activeTab === 'ver' ? styles.navButtonActive : ''}`}
            >
              <FileText size={18} />
              <span>Ver documentos</span>
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={`${styles.navButton} ${activeTab === 'historial' ? styles.navButtonActive : ''}`}
            >
              <Archive size={18} />
              <span>Historial</span>
            </button>
          </nav>

          <section className={styles.documentCard}>
            {activeTab === 'subir' && (
              <div>
                <h2 className={styles.contentTitle} style={{ marginBottom: '1.5rem' }}>Subir Documento PDF</h2>
                <div className={styles.estudianteCard} style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <AlertCircle size={20} style={{ color: '#5b88a5' }} />
                    <span style={{ fontWeight: '500', color: '#243a69' }}>Requisitos:</span>
                  </div>
                  <ul style={{ color: '#5b88a5', fontSize: '0.875rem', margin: '0.5rem 0 0 1.5rem' }}>
                    <li><strong>Solo archivos PDF</strong></li>
                    <li>Máximo 10MB por archivo</li>
                    <li>1 archivo por subida</li>
                  </ul>
                </div>

                <div className={styles.uploadArea}>
                  <Upload size={48} style={{ color: '#5b88a5', margin: '0 auto 1rem', display: 'block' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#243a69', marginBottom: '0.5rem' }}>
                    Arrastra tu archivo PDF aquí
                  </h3>
                  <p style={{ color: '#5b88a5', marginBottom: '1.5rem' }}>
                    o haz clic para seleccionar un PDF
                  </p>
                  <input
                    id="pdf-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                    className={styles.fileInput}
                  />
                  <label
                    htmlFor="pdf-upload"
                    className={styles.submitButton}
                  >
                    <FileText size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
                    Seleccionar PDF
                  </label>
                </div>

                {selectedFile && (
                  <div className={styles.filesPreview}>
                    <h3 className={styles.filesPreviewTitle}>
                      PDF seleccionado:
                    </h3>
                    <div className={styles.fileItem}>
                      <div className={styles.fileInfo}>
                        <div className={styles.fileIcon}>
                          <CheckCircle size={20} style={{ color: '#10b981' }} />
                        </div>
                        <div className={styles.fileDetails}>
                          <p className={styles.fileName} title={selectedFile.name}>{selectedFile.name}</p>
                          <p className={styles.fileSize}>
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={clearUpload}
                        className={styles.fileRemove}
                        title="Eliminar archivo"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {selectedFile && uploadStatus === 'idle' && (
                  <div className={styles.textRight}>
                    <button
                      onClick={handleUploadDocuments}
                      disabled={isUploading}
                      className={styles.uploadButton}
                    >
                      Subir PDF
                    </button>
                  </div>
                )}

                {uploadStatus !== 'idle' && (
                  <div className={styles.filesPreview}>
                    <h3 className={styles.filesPreviewTitle}>Estado de la subida:</h3>
                    <div className={styles.fileItem}>
                      <div className={styles.fileInfo}>
                        <div className={styles.fileIcon}>
                          {uploadStatus === 'uploading' && (
                            <div style={{
                              width: '20px', height: '20px',
                              border: '2px solid #e5e7eb', borderTop: '2px solid #5b88a5',
                              borderRadius: '50%', animation: 'spin 1s linear infinite',
                              display: 'inline-block'
                            }}></div>
                          )}
                          {uploadStatus === 'success' && <CheckCircle size={20} style={{ color: '#10b981' }} />}
                          {uploadStatus === 'error' && <AlertCircle size={20} style={{ color: '#ef4444' }} />}
                        </div>
                        <div className={styles.fileDetails}>
                          <p className={styles.fileName}>{uploadMessage}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ver' && (
              <div>
                <h2 className={styles.contentTitle} style={{ marginBottom: '1.5rem' }}>Documentos del Proyecto</h2>
                <DocumentList documentos={documents} onDocumentClick={handleDocumentClick} />
              </div>
            )}

            {activeTab === 'historial' && (
              <div>
                <h2 className={styles.contentTitle} style={{ marginBottom: '1.5rem' }}>Historial de Actividades</h2>
                <DocumentList documentos={documents} onDocumentClick={handleDocumentClick} />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default EstudianteConGrupoPage;