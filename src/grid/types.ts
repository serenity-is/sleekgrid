import type { EventEmitter, CellRange } from "../core";
import type { Grid } from "./grid";

export interface IPlugin {
    init(grid: Grid): void;
    pluginName?: string;
    destroy?: () => void;
}

export interface ViewportInfo {
    height: number;
    width: number;
    hasVScroll: boolean;
    hasHScroll: boolean;
    headerHeight: number;
    groupingPanelHeight: number;
    virtualHeight: number;
    realScrollHeight: number;
    topPanelHeight: number;
    headerRowHeight: number;
    footerRowHeight: number;
    numVisibleRows: number;
}

export interface SelectionModel extends IPlugin {
    setSelectedRanges(ranges: CellRange[]): void;
    onSelectedRangesChanged: EventEmitter<CellRange[]>;
    refreshSelections?(): void;
}

export interface ViewRange {
    top?: number;
    bottom?: number;
    leftPx?: number;
    rightPx?: number;
}
