import type { PDFDocumentProxy } from "pdfjs-dist";
import type { EventBus, PDFViewer } from "pdfjs-dist/legacy/web/pdf_viewer.mjs";
import type { PDFViewerOptions } from "pdfjs-dist/types/web/pdf_viewer";
import React, {
  JSX,
  type PointerEventHandler,
  PureComponent,
  type RefObject,
} from "react";
import { type Root, createRoot } from "react-dom/client";
import { debounce } from "ts-debounce";
import { scaledToViewport, viewportToScaled } from "../lib/coordinates";
import { getAreaAsPNG } from "../lib/get-area-as-png";
import { getBoundingRect } from "../lib/get-bounding-rect";
import { getClientRects } from "../lib/get-client-rects";
import {
  findOrCreateContainerLayer,
  getPageFromElement,
  getPagesFromRange,
  getWindow,
  isHTMLElement,
} from "../lib/pdfjs-dom";
import styles from "../style/PdfHighlighter.module.css";
import type {
  IHighlight,
  LTWH,
  LTWHP,
  Position,
  Scaled,
  ScaledPosition,
} from "../types";
import { HighlightLayer } from "./HighlightLayer";
import { TipContainer } from "./TipContainer";

export type T_ViewportHighlight<T_HT> = { position: Position } & T_HT;

interface State<T_HT> {
  tip: {
    highlight: T_ViewportHighlight<T_HT>;
    callback: (highlight: T_ViewportHighlight<T_HT>) => JSX.Element;
  } | null;
  tipPosition: Position | null;
  tipChildren: JSX.Element | null;
  scrolledToHighlightId: string;
}

interface Props<T_HT> {
  highlightTransform: (
    highlight: T_ViewportHighlight<T_HT>,
    index: number,
    setTip: (
      highlight: T_ViewportHighlight<T_HT>,
      callback: (highlight: T_ViewportHighlight<T_HT>) => JSX.Element,
    ) => void,
    hideTip: () => void,
    viewportToScaled: (rect: LTWHP) => Scaled,
    screenshot: (position: LTWH) => string,
    isScrolledTo: boolean,
  ) => JSX.Element;
  highlights: Array<T_HT>;
  onScrollChange: () => void;
  scrollRef: (scrollTo: (highlight: T_HT) => void) => void;
  pdfDocument: PDFDocumentProxy;
  pdfScaleValue: string;
  pdfViewerOptions?: PDFViewerOptions;
}

const EMPTY_ID = "empty-id";

export class PdfHighlighterEstudiante<T_HT extends IHighlight> extends PureComponent<
  Props<T_HT>,
  State<T_HT>
> {

  isReady = false;

  static defaultProps = {
    pdfScaleValue: "auto",
  };

  state: State<T_HT> = {
    scrolledToHighlightId: EMPTY_ID,
    tip: null,
    tipPosition: null,
    tipChildren: null,
  };

  viewer!: PDFViewer;

  resizeObserver: ResizeObserver | null = null;
  containerNode?: HTMLDivElement | null = null;
  containerNodeRef: RefObject<HTMLDivElement | null>;
  highlightRoots: {
    [page: number]: { reactRoot: Root; container: Element };
  } = {};
  unsubscribe = () => {};
  unmountTimeoutId?: NodeJS.Timeout;

  constructor(props: Props<T_HT>) {
    super(props);
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(this.debouncedScaleValue);
    }
    this.containerNodeRef = React.createRef();
  }

  componentDidMount() {
    this.init();
  }

  attachRef = (eventBus: EventBus) => {
    const { resizeObserver: observer } = this;
    this.containerNode = this.containerNodeRef.current;
    this.unsubscribe();

    if (this.containerNode) {
      const { ownerDocument: doc } = this.containerNode;
      eventBus.on("textlayerrendered", this.onTextLayerRendered);
      eventBus.on("pagesinit", this.onDocumentReady);
      doc.addEventListener("keydown", this.handleKeyDown);
      doc.defaultView?.addEventListener("resize", this.debouncedScaleValue);
      if (observer) observer.observe(this.containerNode);

      this.unsubscribe = () => {
        eventBus.off("pagesinit", this.onDocumentReady);
        eventBus.off("textlayerrendered", this.onTextLayerRendered);
        doc.removeEventListener("keydown", this.handleKeyDown);
        doc.defaultView?.removeEventListener(
          "resize",
          this.debouncedScaleValue,
        );
        if (observer) observer.disconnect();
      };
    }
  };

  componentDidUpdate(prevProps: Props<T_HT>) {
    if (prevProps.pdfDocument !== this.props.pdfDocument) {
      this.init();
      return;
    }
    if (prevProps.highlights !== this.props.highlights) {
      this.renderHighlightLayers();
    }
  }

  async init() {
    this.isReady = false;
    console.log("=== DEBUG: init() started");
    const { pdfDocument, pdfViewerOptions } = this.props;
    const pdfjs = await import("pdfjs-dist/web/pdf_viewer.mjs");

    const eventBus = new pdfjs.EventBus();

    const linkService = new pdfjs.PDFLinkService({
      eventBus,
      externalLinkTarget: 2,
    });

    if (!this.containerNodeRef.current) {
      console.error("=== DEBUG: init() - Container ref not found!");
      throw new Error("Container node not found!");
    }

    this.viewer =
      this.viewer ||
      new pdfjs.PDFViewer({
        container: this.containerNodeRef.current,
        eventBus: eventBus,
        textLayerMode: 2,
        removePageBorders: true,
        linkService: linkService,
        ...pdfViewerOptions,
      });

    linkService.setDocument(pdfDocument);
    linkService.setViewer(this.viewer);

    this.viewer.setDocument(pdfDocument);
    console.log("=== DEBUG: setDocument called");

    this.attachRef(eventBus);
    console.log("=== DEBUG: attachRef called after setDocument");

    const checkPagesReady = () => {
      if (
        this.viewer._pages &&
        this.viewer._pages.length > 0 &&
        this.viewer._pages[0] &&
        this.viewer._pages[0].viewport
      ) {
        console.log("=== DEBUG: Pages ready in fallback, calling onDocumentReady");
        this.onDocumentReady();
        return true;
      }
      return false;
    };

    if (checkPagesReady()) return;

    const timeouts = [100, 500, 1000, 2000];
    timeouts.forEach((delay, index) => {
      setTimeout(() => {
        if (!this.state.scrolledToHighlightId || this.state.scrolledToHighlightId === EMPTY_ID) {
          if (checkPagesReady()) {
            console.log(`=== DEBUG: Fallback timeout ${delay}ms triggered onDocumentReady`);
          }
        }
      }, delay);
    });

    const originalOnTextLayerRendered = this.onTextLayerRendered;
    eventBus.on("pagerendered", (e: { pageNumber: number; }) => {
      console.log("=== DEBUG: pagerendered event for page", e.pageNumber);
      if (e.pageNumber === 1 && !checkPagesReady()) {
        console.log("=== DEBUG: First page rendered, forcing onDocumentReady");
        this.onDocumentReady();
      }
      originalOnTextLayerRendered();
    });
  }

componentWillUnmount() {
  this.unsubscribe();
  
  // Limpiar timeout previo si existe
  if (this.unmountTimeoutId) {
    clearTimeout(this.unmountTimeoutId);
  }

  // Desmontar de forma asíncrona para evitar condición de carrera
  const rootsToUnmount = Object.values(this.highlightRoots);
  this.highlightRoots = {}; // Limpiar referencia inmediatamente
  
  this.unmountTimeoutId = setTimeout(() => {
    rootsToUnmount.forEach(({ reactRoot, container }) => {
      try {
        // Verificar que el contenedor aún está en el DOM antes de desmontar
        if (container.isConnected) {
          queueMicrotask(() => {
            try {
              reactRoot.unmount();
            } catch (e) {
              console.error("Error unmounting root:", e);
            }
          });
        }
      } catch (e) {
        console.error("Error in unmount process:", e);
      }
    });
  }, 0);
}

  findOrCreateHighlightLayer(page: number) {
    const { textLayer } = this.viewer.getPageView(page - 1) || {};

    if (!textLayer) {
      return null;
    }

    return findOrCreateContainerLayer(
      textLayer.div,
      `PdfHighlighter__highlight-layer ${styles.highlightLayer}`,
      ".PdfHighlighter__highlight-layer",
    );
  }

  groupHighlightsByPage(highlights: Array<T_HT>): {
    [pageNumber: string]: Array<T_HT>;
  } {
    const allHighlights = [...highlights];

    const pageNumbers = new Set<number>();
    for (const highlight of allHighlights) {
      pageNumbers.add(highlight.position.pageNumber);
      for (const rect of highlight.position.rects) {
        if (rect.pageNumber) {
          pageNumbers.add(rect.pageNumber);
        }
      }
    }

    const groupedHighlights: Record<number, T_HT[]> = {};

    for (const pageNumber of pageNumbers) {
      groupedHighlights[pageNumber] = groupedHighlights[pageNumber] || [];
      for (const highlight of allHighlights) {
        const pageSpecificHighlight = {
          ...highlight,
          position: {
            pageNumber,
            boundingRect: highlight.position.boundingRect,
            rects: [],
            usePdfCoordinates: highlight.position.usePdfCoordinates,
          } as ScaledPosition,
        };
        let anyRectsOnPage = false;
        for (const rect of highlight.position.rects) {
          if (
            pageNumber === (rect.pageNumber || highlight.position.pageNumber)
          ) {
            pageSpecificHighlight.position.rects.push(rect);
            anyRectsOnPage = true;
          }
        }
        if (anyRectsOnPage || pageNumber === highlight.position.pageNumber) {
          groupedHighlights[pageNumber].push(pageSpecificHighlight);
        }
      }
    }

    return groupedHighlights;
  }

  showTip(highlight: T_ViewportHighlight<T_HT>, content: JSX.Element) {
    this.setTip(highlight.position, content);
  }

  scaledPositionToViewport({
    pageNumber,
    boundingRect,
    rects,
    usePdfCoordinates,
  }: ScaledPosition): Position {
    const viewport = this.viewer.getPageView(pageNumber - 1).viewport;

    return {
      boundingRect: scaledToViewport(boundingRect, viewport, usePdfCoordinates),
      rects: (rects || []).map((rect) =>
        scaledToViewport(rect, viewport, usePdfCoordinates),
      ),
      pageNumber,
    };
  }

  viewportPositionToScaled({
    pageNumber,
    boundingRect,
    rects,
  }: Position): ScaledPosition {
    const viewport = this.viewer.getPageView(pageNumber - 1).viewport;

    return {
      boundingRect: viewportToScaled(boundingRect, viewport),
      rects: (rects || []).map((rect) => viewportToScaled(rect, viewport)),
      pageNumber,
    };
  }

  screenshot(position: LTWH, pageNumber: number) {
    const canvas = this.viewer.getPageView(pageNumber - 1).canvas;

    return getAreaAsPNG(canvas, position);
  }

  hideTipAndSelection = () => {
    this.setState({
      tipPosition: null,
      tipChildren: null,
    });

    this.setState({ tip: null }, () =>
      this.renderHighlightLayers(),
    );
  };

  setTip(position: Position, inner: JSX.Element | null) {
    this.setState({
      tipPosition: position,
      tipChildren: inner,
    });
  }

  renderTip = () => {
    const { tipPosition, tipChildren } = this.state;
    if (!tipPosition) return null;

    const { boundingRect, pageNumber } = tipPosition;
    const page = {
      node: this.viewer.getPageView((boundingRect.pageNumber || pageNumber) - 1)
        .div,
      pageNumber: boundingRect.pageNumber || pageNumber,
    };

    const pageBoundingClientRect = page.node.getBoundingClientRect();

    const pageBoundingRect = {
      bottom: pageBoundingClientRect.bottom,
      height: pageBoundingClientRect.height,
      left: pageBoundingClientRect.left,
      right: pageBoundingClientRect.right,
      top: pageBoundingClientRect.top,
      width: pageBoundingClientRect.width,
      x: pageBoundingClientRect.x,
      y: pageBoundingClientRect.y,
      pageNumber: page.pageNumber,
    };

    return (
      <TipContainer
        scrollTop={this.viewer.container.scrollTop}
        pageBoundingRect={pageBoundingRect}
        style={{
          left:
            page.node.offsetLeft + boundingRect.left + boundingRect.width / 2,
          top: boundingRect.top + page.node.offsetTop,
          bottom: boundingRect.top + page.node.offsetTop + boundingRect.height,
        }}
      >
        {tipChildren}
      </TipContainer>
    );
  };

  onTextLayerRendered = () => {
    this.renderHighlightLayers();
  };

  scrollTo = (highlight: T_HT) => {
    const { pageNumber, boundingRect, usePdfCoordinates } = highlight.position;

    this.viewer.container.removeEventListener("scroll", this.onScroll);

    const pageViewport = this.viewer.getPageView(pageNumber - 1).viewport;

    const scrollMargin = 10;

    this.viewer.scrollPageIntoView({
      pageNumber,
      destArray: [
        null,
        { name: "XYZ" },
        ...pageViewport.convertToPdfPoint(
          0,
          scaledToViewport(boundingRect, pageViewport, usePdfCoordinates).top -
            scrollMargin,
        ),
        0,
      ],
    });

    this.setState(
      {
        scrolledToHighlightId: highlight.id,
      },
      () => this.renderHighlightLayers(),
    );

    setTimeout(() => {
      this.viewer.container.addEventListener("scroll", this.onScroll);
    }, 100);
  };

  onDocumentReady = () => {
    if (this.isReady) {
      return;
    }
    this.isReady = true;

    console.log("=== DEBUG: onDocumentReady ejecutado por primera vez.");

    const { scrollRef } = this.props;

    this.handleScaleValue();

    this.viewer.viewer?.classList.add(styles.disableSelection);

    if (this.viewer && typeof this.scrollTo === "function") {
      scrollRef(this.scrollTo);
    } else {
      console.error("=== DEBUG: onDocumentReady se llamó pero el viewer o la función scrollTo no estaban listos.");
    }
  };

  onScroll = () => {
    const { onScrollChange } = this.props;

    onScrollChange();

    this.setState(
      {
        scrolledToHighlightId: EMPTY_ID,
      },
      () => this.renderHighlightLayers(),
    );

    this.viewer.container.removeEventListener("scroll", this.onScroll);
  };

  onMouseDown: PointerEventHandler = (event) => {
    if (!(event.target instanceof Element) || !isHTMLElement(event.target)) {
      return;
    }

    if (event.target.closest("#PdfHighlighter__tip-container")) {
      return;
    }

    this.hideTipAndSelection();
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === "Escape") {
      this.hideTipAndSelection();
    }
  };

  handleScaleValue = () => {
    if (this.viewer) {
      this.viewer.currentScaleValue = this.props.pdfScaleValue;
    }
  };

  debouncedScaleValue: () => void = debounce(this.handleScaleValue, 500);

  render() {
    return (
      <div onPointerDown={this.onMouseDown}>
        <div
          ref={this.containerNodeRef}
          className={styles.container}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="pdfViewer" />
          {this.renderTip()}
        </div>
      </div>
    );
  }

  private renderHighlightLayers() {
    const { pdfDocument } = this.props;
    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
      const existingRoot = this.highlightRoots[pageNumber];
      
      if (existingRoot?.container.isConnected) {
        // El root ya existe y el contenedor está en el DOM, reutilizarlo
        this.renderHighlightLayer(existingRoot.reactRoot, pageNumber);
      } else {
        // Necesitamos crear un nuevo root
        const highlightLayer = this.findOrCreateHighlightLayer(pageNumber);
        if (highlightLayer) {
          // Verificar si ya existe un root para este contenedor específico
          const existingRootForContainer = Object.values(this.highlightRoots).find(
            root => root.container === highlightLayer
          );

          if (existingRootForContainer) {
            // Ya existe un root para este contenedor, reutilizarlo
            this.renderHighlightLayer(existingRootForContainer.reactRoot, pageNumber);
          } else {
            // Crear un nuevo root solo si no existe uno para este contenedor
            const reactRoot = createRoot(highlightLayer);
            this.highlightRoots[pageNumber] = {
              reactRoot,
              container: highlightLayer,
            };
            this.renderHighlightLayer(reactRoot, pageNumber);
          }
        }
      }
    }
  }

  private renderHighlightLayer(root: Root, pageNumber: number) {
    const { highlightTransform, highlights } = this.props;
    const { tip, scrolledToHighlightId } = this.state;
    root.render(
      <HighlightLayer
        highlightsByPage={this.groupHighlightsByPage(highlights)}
        pageNumber={pageNumber.toString()}
        scrolledToHighlightId={scrolledToHighlightId}
        highlightTransform={highlightTransform}
        tip={tip}
        scaledPositionToViewport={this.scaledPositionToViewport.bind(this)}
        hideTipAndSelection={this.hideTipAndSelection.bind(this)}
        viewer={this.viewer}
        screenshot={this.screenshot.bind(this)}
        showTip={this.showTip.bind(this)}
        setTip={(tip) => {
          this.setState({ tip });
        }}
      />,
    );
  }
}