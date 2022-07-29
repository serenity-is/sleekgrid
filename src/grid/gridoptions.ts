import type { Column } from "./column";
import { EditorLock, GlobalEditorLock } from "../core/editlock";
import type { EditCommand, EditorFactory } from "./editor";
import type { ColumnFormatter, FormatterFactory } from "./formatting";
import { defaultFormatter } from "./internal";

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
    frozenColumn?: number;
    frozenRow?: number;
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
    footerRowHeight: 32,
    forceFitColumns: false,
    forceSyncScrolling: false,
    formatterFactory: null,
    frozenBottom: false,
    frozenRow: -1,
    fullWidthRows: false,
    groupingPanel: false,
    groupingPanelHeight: 34,
    headerRowHeight: 32,
    leaveSpaceForNewRows: false,
    useLegacyUI: true,
    minBuffer: 3,
    multiColumnSort: false,
    multiSelect: true,
    renderAllCells: false,
    rowHeight: 32,
    selectedCellCssClass: "selected",
    showCellSelection: true,
    showColumnHeader: true,
    showFooterRow: false,
    showGroupingPanel: true,
    showHeaderRow: false,
    showTopPanel: false,
    suppressActiveCellChangeOnEdit: false,
    topPanelHeight: 25
}
