declare module 'pdf-annotate.js' {
  export namespace UI {
    interface Annotation {
      type: string;
      page: number;
      rect: number[];
      color: string;
    }
    
    interface Adapter {
      addAnnotation(annotation: Annotation): Promise<void>;
      getAnnotations(page: number): Promise<Annotation[]>;
      deleteAnnotation(annotationId: string): Promise<void>;
    }
    
    function initialize(container: HTMLElement): {
      getAdapter(): Adapter;
    };
  }
}