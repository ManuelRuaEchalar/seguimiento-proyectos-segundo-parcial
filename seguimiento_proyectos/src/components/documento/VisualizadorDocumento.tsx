'use client';
import React, { useEffect, useState } from 'react';
import * as mammoth from 'mammoth';

interface VisualizadorDocumentoProps {
  blob: Blob;
  contentType: string;
}

export default function VisualizadorDocumento({
  blob,
  contentType
}: VisualizadorDocumentoProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const convertDocxToHtml = async () => {
      try {
        setLoading(true);
        const arrayBuffer = await blob.arrayBuffer();
        
        // Configuración mejorada para preservar más estilos
        const options = {
          // Incluir el mapa de estilos por defecto
          includeDefaultStyleMap: true,
          
          // Mapa de estilos más completo
          styleMap: [
            // Alineaciones de párrafos
            "p[style-name='Center'] => p.center",
            "p[style-name='Centered'] => p.center", 
            "p[style-name='Right'] => p.right",
            "p[style-name='Justify'] => p.justify",
            
            // Encabezados con alineación
            "p[style-name='Heading 1 Center'] => h1.center",
            "p[style-name='Heading 1 Centered'] => h1.center",
            "p[style-name='Heading 2 Center'] => h2.center",
            "p[style-name='Heading 3 Center'] => h3.center",
            
            // Estilos de tabla
            "table => table.docx-table",
            "table[style-name='Table Grid'] => table.table-grid",
            "table[style-name='Table Normal'] => table.table-normal",
            
            // Estilos de texto comunes
            "p[style-name='Normal'] => p.normal",
            "p[style-name='Body Text'] => p.body-text",
            "p[style-name='Title'] => h1.title",
            "p[style-name='Subtitle'] => h2.subtitle",
            
            // Listas
            "p[style-name='List Paragraph'] => p.list-paragraph",
            
            // Texto con formato específico
            "strong => strong.bold",
            "em => em.italic",
            "u => span.underline"
          ],
          
          // Transformador personalizado para preservar atributos de alineación
          transformDocument: (element: any) => {
            // Este transformador puede ayudar a preservar algunos estilos adicionales
            return element;
          },
          
          // Convertir imágenes inline
          convertImage: mammoth.images.imgElement((image: any) => {
            return image.read("base64").then((imageBuffer: string) => ({
              src: `data:${image.contentType};base64,${imageBuffer}`
            }));
          })
        };
        
        const result = await mammoth.convertToHtml({ arrayBuffer }, options);
        
        // Post-procesamiento para detectar patrones de alineación
        let processedHtml = result.value;
        
        // Detectar y convertir algunos patrones comunes de alineación
        processedHtml = postProcessAlignment(processedHtml);
        
        setHtmlContent(processedHtml);
        setError('');
        
        // Mostrar advertencias si las hay
        if (result.messages.length > 0) {
          console.warn('Advertencias de conversión:', result.messages);
        }
        
      } catch (err) {
        console.error('Error al convertir documento:', err);
        setError('No se pudo procesar el documento');
      } finally {
        setLoading(false);
      }
    };

    if (blob) {
      convertDocxToHtml();
    }
  }, [blob]);

  // Función para post-procesar y detectar alineaciones
  const postProcessAlignment = (html: string): string => {
    // Esta función puede ayudar a detectar patrones comunes de texto centrado
    // basándose en el contenido y estructura
    
    // Detectar títulos que probablemente deberían estar centrados
    html = html.replace(
      /<h([1-6])>([^<]*(?:TÍTULO|TITLE|CENTRO|CENTER|ENCABEZADO)[^<]*)<\/h[1-6]>/gi,
      '<h$1 class="likely-center">$2</h$1>'
    );
    
    // Detectar párrafos cortos que podrían ser títulos centrados
    html = html.replace(
      /<p>([^<]{1,100}?(?:TÍTULO|TITLE|CENTRO|CENTER)[^<]*?)<\/p>/gi,
      '<p class="likely-center">$1</p>'
    );
    
    return html;
  };

  const handleObservar = () => {
    console.log('Botón observar clickeado');
  };

  const handleAnotar = () => {
    console.log('Botón anotar clickeado');
  };

  if (loading) {
    return (
      <div className="visualizador-documento">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando documento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="visualizador-documento">
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="visualizador-documento">
      <div className="documento-content">
        {/* Estilos CSS mejorados para preservar formato */}
        <style>{`
          /* Alineaciones básicas */
          .center, .likely-center { 
            text-align: center !important; 
          }
          .right { 
            text-align: right !important; 
          }
          .justify { 
            text-align: justify !important; 
          }
          .left { 
            text-align: left !important; 
          }
          
          /* Estilos de texto */
          .bold { 
            font-weight: bold !important; 
          }
          .italic { 
            font-style: italic !important; 
          }
          .underline { 
            text-decoration: underline !important; 
          }
          
          /* Estilos de tabla mejorados */
          .docx-table, .table-grid, .table-normal { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 10px 0;
          }
          .docx-table td, .docx-table th,
          .table-grid td, .table-grid th,
          .table-normal td, .table-normal th { 
            border: 1px solid #ccc; 
            padding: 8px; 
            text-align: left;
          }
          
          /* Estilos de párrafo */
          .normal, .body-text {
            margin: 10px 0;
            line-height: 1.5;
          }
          
          .list-paragraph {
            margin-left: 20px;
          }
          
          /* Estilos de encabezados */
          .title {
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0;
          }
          
          .subtitle {
            font-size: 18px;
            font-weight: bold;
            margin: 15px 0;
          }
          
          /* Mejorar la presentación general */
          .html-content {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            color: #333;
          }
          
          .html-content p {
            margin: 10px 0;
          }
          
          .html-content h1, .html-content h2, .html-content h3 {
            margin: 20px 0 10px 0;
          }
          
          /* Estilos para preservar espaciado */
          .html-content br + br {
            display: block;
            margin: 10px 0;
            content: "";
          }
        `}</style>
        
        <div 
          className="html-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
      
      <div className="barra-herramientas">
        <button 
          onClick={handleObservar}
          className="btn-herramienta btn-observar"
        >
          Observar
        </button>
        <button 
          onClick={handleAnotar}
          className="btn-herramienta btn-anotar"
        >
          Anotar
        </button>
      </div>
    </div>
  );
}