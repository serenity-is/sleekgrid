import { Column } from "../column";
import { GridOptions } from "../gridoptions";
import { ViewportSize } from "../types";

export interface LayoutHost {
    bindAncestorScroll(el: Element): void;
    getAvailableWidth(): number;
    getColumnCssRules(idx: number): { right: any; left: any; }
    getColumns(): Column[];
    getContainerNode(): HTMLElement;
    getOptions(): GridOptions;
    getScrollDims(): { width: number, height: number };
    getScrollLeft(): number;
    getScrollTop(): number;
    getViewportSize(): ViewportSize;
}

export interface LayoutEngine {
    afterHeaderColumnDrag(): void;
    afterSetOptions(args: GridOptions): void;
    applyColumnWidths(): void;
    bindAncestorScrollEvents(): void;
    calcCanvasWidth(): number;
    calcHeaderWidths(): void;
    canCleanupRow(i: number): boolean;
    destroy(): void;
    getCanvasNodeFor(cell: number, row: number): HTMLDivElement;
    getCanvasNodes(): HTMLDivElement[];
    getCanvasWidth(): number;
    getFooterRowCols(): HTMLDivElement[];
    getFooterRowColsFor(cell: number): HTMLDivElement;
    getFooterRowColumn(cell: number): HTMLDivElement;
    getHeaderCols(): HTMLDivElement[];
    getHeaderColsFor(cell: number): HTMLDivElement;
    getHeaderColumn(cell: number): HTMLDivElement;
    getHeaderRowCols(): HTMLDivElement[];
    getHeaderRowColsFor(cell: number): HTMLDivElement;
    getHeaderRowColumn(cell: number): HTMLDivElement;
    getScrollCanvasY(): HTMLDivElement;
    getScrollContainerX(): HTMLDivElement;
    getScrollContainerY(): HTMLDivElement;
    getTopPanelFor(arg0: number): HTMLDivElement;
    getTopPanelNodes(): HTMLDivElement[];
    getViewportHasHScroll(): boolean;
    getViewportHasVScroll(): boolean;
    getViewportNodeFor(cell: number, row: number): HTMLDivElement;
    getViewportNodes(): HTMLDivElement[];
    handleScrollH(): void;
    handleScrollV(): void;
    init(host: LayoutHost): void;
    layoutName: string;
    realScrollHeightChange(h: number): void;
    reorderViewColumns(viewCols: Column[]): Column[];
    resizeCanvas(): void;
    setPaneVisibility(): void;
    setScroller(): void;
    setOverflow(): void;
    updateCanvasWidth(): boolean;
}
