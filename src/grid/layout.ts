import { Column } from "./column";
import { GridOptions } from "./gridoptions";
import { CachedRow } from "./internal";
import { RowCell, ViewportInfo, ViewRange } from "./types";

export interface LayoutHost {
    bindAncestorScroll(el: Element): void;
    cleanUpAndRenderCells(range: ViewRange): void;
    getAvailableWidth(): number;
    getCellFromPoint(x: number, y: number): RowCell;
    getColumnCssRules(idx: number): { right: any; left: any; }
    getColumns(): Column[];
    getContainerNode(): HTMLElement;
    getDataLength(): number;
    getOptions(): GridOptions;
    getRowFromNode(rowNode: Element): number;
    getScrollDims(): { width: number, height: number };
    getScrollLeft(): number;
    getScrollTop(): number;
    getViewportInfo(): ViewportInfo;
    renderRows(range: ViewRange): void;
}

export interface LayoutEngine {
    appendCachedRow(row: number, rowNodeL: HTMLDivElement, rowNodeR: HTMLDivElement): void;
    afterHeaderColumnDrag(): void;
    afterSetOptions(args: GridOptions): void;
    applyColumnWidths(): void;
    beforeCleanupAndRenderCells(rendered: ViewRange): void;
    afterRenderRows(rendered: ViewRange): void;
    bindAncestorScrollEvents(): void;
    calcCanvasWidth(): number;
    calcHeaderWidths(): void;
    isFrozenRow(row: number): boolean;
    destroy(): void;
    getCanvasNodeFor(cell: number, row: number): HTMLDivElement;
    getCanvasNodes(): HTMLDivElement[];
    getCanvasWidth(): number;
    getRowFromCellNode(cellNode: HTMLElement, clientX: number, clientY: number): number;
    getFooterRowCols(): HTMLDivElement[];
    getFooterRowColsFor(cell: number): HTMLDivElement;
    getFooterRowColumn(cell: number): HTMLDivElement;
    getFrozenCols(): number;
    getFrozenRowOffset(row: number): number;
    getFrozenRows(): number;
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
    getViewportNodeFor(cell: number, row: number): HTMLDivElement;
    getViewportNodes(): HTMLDivElement[];
    handleScrollH(): void;
    handleScrollV(): void;
    init(host: LayoutHost): void;
    layoutName: string;
    realScrollHeightChange(): void;
    /** this might be called before init, chicken egg situation */
    reorderViewColumns(viewCols: Column[], options?: GridOptions): Column[];
    resizeCanvas(): void;
    setPaneVisibility(): void;
    setScroller(): void;
    setOverflow(): void;
    updateCanvasWidth(): boolean;
}
