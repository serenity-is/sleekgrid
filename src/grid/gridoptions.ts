import type { Column } from "./column";
import { EditorLock, GlobalEditorLock } from "../core/editlock";
import type { EditCommand, EditorFactory } from "./editor";
import { ColumnFormatter, FormatterFactory, defaultFormatter } from "./formatting";

export interface GridOptions<TItem = any> {
    addNewRowCssClass?: string;
    alwaysAllowHorizontalScroll?: boolean;
    alwaysShowVerticalScroll?: boolean;
    asyncEditorLoadDelay?: number;
    asyncEditorLoading?: boolean;
    asyncPostCleanupDelay?: number;
    asyncPostRenderDelay?: number;
    autoEdit?: boolean;
    autoHeight?: boolean;
    cellFlashingCssClass?: string;
    cellHighlightCssClass?: string;
    columns?: Column<TItem>[];
    createPreHeaderPanel?: boolean;
    dataItemColumnValueExtractor?: (item: TItem, column: Column<TItem>) => void;
    defaultColumnWidth?: number;
    defaultFormatter?: ColumnFormatter<TItem>;
    editable?: boolean;
    editCommandHandler?: (item: TItem, column: Column<TItem>, command: EditCommand) => void;
    editorFactory?: EditorFactory;
    editorLock?: EditorLock;
    enableAddRow?: boolean;
    enableAsyncPostRender?: boolean;
    enableAsyncPostRenderCleanup?: boolean;
    enableCellNavigation?: boolean;
    enableCellRangeSelection?: boolean;
    enableColumnReorder?: boolean;
    enableRowReordering?: boolean;
    enableTabKeyNavigation?: boolean;
    enableTextSelectionOnCells?: boolean;
    explicitInitialization?: boolean;
    footerRowHeight?: number;
    forceFitColumns?: boolean;
    forceSyncScrolling?: boolean;
    formatterFactory?: FormatterFactory;
    frozenBottom?: boolean;
    frozenColumns?: number;
    frozenRows?: number;
    fullWidthRows?: boolean;
    groupingPanel?: boolean,
    groupingPanelHeight?: number;
    headerRowHeight?: number;
    leaveSpaceForNewRows?: boolean;
    minBuffer?: number;
    multiColumnSort?: boolean;
    multiSelect?: boolean;
    preHeaderPanelHeight?: number;
    renderAllCells?: boolean;
    rowHeight?: number;
    selectedCellCssClass?: string;
    showCellSelection?: boolean;
    showColumnHeader?: boolean;
    showFooterRow?: boolean;
    showGroupingPanel?: boolean;
    showHeaderRow?: boolean;
    showPreHeaderPanel?: boolean;
    showTopPanel?: boolean;
    slickCompat?: boolean;
    suppressActiveCellChangeOnEdit?: boolean;
    syncColumnCellResize?: boolean;
    topPanelHeight?: number;
    useLegacyUI?: boolean;
    viewportClass?: string;
}

export const gridDefaults: GridOptions = {
    addNewRowCssClass: "new-row",
    alwaysAllowHorizontalScroll: false,
    alwaysShowVerticalScroll: false,
    asyncEditorLoadDelay: 100,
    asyncEditorLoading: false,
    asyncPostCleanupDelay: 40,
    asyncPostRenderDelay: 50,
    autoEdit: true,
    autoHeight: false,
    cellFlashingCssClass: "flashing",
    dataItemColumnValueExtractor: null,
    defaultColumnWidth: 80,
    defaultFormatter: defaultFormatter,
    editable: false,
    editorFactory: null,
    editorLock: GlobalEditorLock,
    enableAddRow: false,
    enableAsyncPostRender: false,
    enableAsyncPostRenderCleanup: false,
    enableCellNavigation: true,
    enableColumnReorder: true,
    enableTabKeyNavigation: true,
    enableTextSelectionOnCells: false,
    explicitInitialization: false,
    footerRowHeight: 30,
    forceFitColumns: false,
    forceSyncScrolling: false,
    formatterFactory: null,
    fullWidthRows: false,
    groupingPanel: false,
    groupingPanelHeight: 30,
    headerRowHeight: 30,
    leaveSpaceForNewRows: false,
    useLegacyUI: true,
    minBuffer: 3,
    multiColumnSort: false,
    multiSelect: true,
    renderAllCells: false,
    rowHeight: 30,
    selectedCellCssClass: "selected",
    showCellSelection: true,
    showColumnHeader: true,
    showFooterRow: false,
    showGroupingPanel: true,
    showHeaderRow: false,
    showTopPanel: false,
    suppressActiveCellChangeOnEdit: false,
    topPanelHeight: 30
}
