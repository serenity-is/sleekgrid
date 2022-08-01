import type { Event, Range } from "../core/index";
import type { Grid } from "./grid";

export interface IPlugin {
    init(grid: Grid): void;
    pluginName?: string;
    destroy?: () => void;
}

export interface Position {
    bottom?: number;
    height?: number;
    left?: number;
    right?: number;
    top?: number;
    visible?: boolean;
    width?: number;
}

export interface ViewportSize {
    height: number;
    width: number;
    headerHeight: number;
    groupingPanelHeight: number;
    topPanelHeight: number;
    headerRowHeight: number;
    footerRowHeight: number;
}

export interface RowCell {
    row: number;
    cell: number;
}

export interface SelectionModel extends IPlugin {
    setSelectedRanges(ranges: Range[]): void;
    onSelectedRangesChanged: Event<Range[]>;
    refreshSelections?(): void;
}

export interface ViewRange {
    top?: number;
    bottom?: number;
    leftPx?: number;
    rightPx?: number;
}
