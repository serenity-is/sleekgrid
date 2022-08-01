export interface Layout {
    afterHeaderColumnDrag(): void;
    bindAncestorScrollEvents(): void;
    calcCanvasWidth(): number;
    calcHeaderWidths(): void;
    getCanvasNodeFor(cell: number, row: number): HTMLDivElement;
    getCanvasNodes(): HTMLDivElement[];
    getFooterRowCols(): HTMLDivElement[];
    getFooterRowColsFor(cell: number): HTMLDivElement;
    getFooterRowColumn(cell: number): HTMLDivElement;
    getHeaderCols(): HTMLDivElement[];
    getHeaderColsFor(cell: number): HTMLDivElement;
    getHeaderColumn(cell: number): HTMLDivElement;
    getHeaderRowCols(): HTMLDivElement[];
    getHeaderRowColsFor(cell: number): HTMLDivElement;
    getHeaderRowColumn(cell: number): HTMLDivElement;
    getViewportNodeFor(cell: number, row: number): HTMLDivElement;
    getViewportNodes(): HTMLDivElement[];
    handleScrollH(): void;
    handleScrollV(): void;
    setPaneVisibility(): void;
    setScroller(): void;
    setOverflow(): void;
    updateCanvasWidth(): boolean;
}
