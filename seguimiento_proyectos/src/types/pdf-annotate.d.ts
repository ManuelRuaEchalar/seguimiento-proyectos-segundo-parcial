declare module 'pdf-annotate.js/dist/js/PDFAnnotate' {
  export function render(svg: SVGSVGElement, viewport: any, annotations: any[]): Promise<SVGSVGElement>;
  export function getAnnotations(documentId: string, pageNumber: number): Promise<any[]>;
  export function setStoreAdapter(adapter: any): void;
  export function getStoreAdapter(): any;
  
  export class LocalStoreAdapter {
    constructor();
  }
}