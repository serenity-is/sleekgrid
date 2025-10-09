import { type LayoutEngine } from "../grid/layout";
import { type Column } from "./column";
import { GlobalEditorLock, type EditCommand, type EditorFactory, type EditorLock } from "./editing";
import { defaultColumnFormat, type ColumnFormat, type CompatFormatter, type FormatterContext, type FormatterFactory, type FormatterResult } from "./formatting";
import { type IGroupTotals } from "./group";

/**
 * Configuration options for the SleekGrid component.
 *
 * @template TItem - The type of items in the grid.
 */
export interface GridOptions<TItem = any> {
    /**
     * CSS class applied to newly added rows for custom styling. Default is `"new-row"`.
     */
    addNewRowCssClass?: string;

    /**
     * Defaults to `false`. If `true`, a horizontal scrollbar is always visible regardless of content width.
     */
    alwaysAllowHorizontalScroll?: boolean;

    /**
     * Defaults to `false`. If `true`, a vertical scrollbar is always visible, useful for fixed-height grids or menus.
     */
    alwaysShowVerticalScroll?: boolean;

    /**
     * Defaults to `100`. Delay in milliseconds before asynchronous loading of editors.
     */
    asyncEditorLoadDelay?: number;

    /**
     * Defaults to `false`. If `true`, editors are loaded asynchronously, reducing initial rendering load.
     */
    asyncEditorLoading?: boolean;

    /**
     * Defaults to `40`. Delay in milliseconds before cleaning up post-rendered elements.
     */
    asyncPostCleanupDelay?: number;

    /**
     * Defaults to `-1` which means immediate execution. Delay in milliseconds before starting asynchronous post-rendering.
     */
    asyncPostRenderDelay?: number;

    /**
     * Defaults to `true`. If `true`, automatically opens the cell editor when a cell gains focus.
     */
    autoEdit?: boolean;

    /**
     * Defaults to `false`. If `true`, automatically adjusts the grid's height to fit the entire content without scrolling.
     */
    autoHeight?: boolean;

    /**
     * CSS class applied to cells with a flashing effect. Default is `"flashing"`.
     */
    cellFlashingCssClass?: string;

    /**
     * Function to handle clearing a DOM node, used for custom cleanup logic. Default is `null`.
     */
    emptyNode?: (node: Element) => void;

    /**
     * Array of column definitions for the grid.
     */
    columns?: Column<TItem>[];

    /**
     * Defaults to `false`. If `true`, creates an extra pre-header panel for column grouping.
     */
    createPreHeaderPanel?: boolean;

    /**
     * Function to extract column values from data items, used for custom copy buffer operations. Default is `null`.
     */
    dataItemColumnValueExtractor?: (item: TItem, column: Column<TItem>) => void;

    /**
     * Defaults to `80`. Default width of columns in pixels.
     */
    defaultColumnWidth?: number;

    /**
     * Default formatting options for columns. Default is `defaultColumnFormat`.
     */
    defaultFormat?: ColumnFormat<TItem>;

    /**
     * Default formatter function for cells.
     */
    defaultFormatter?: CompatFormatter<TItem>;

    /**
     * Defaults to `false`. If `true`, cells can be edited inline.
     */
    editable?: boolean;

    /**
     * Function to handle edit commands, useful for implementing custom undo support. Default is `null`.
     */
    editCommandHandler?: (item: TItem, column: Column<TItem>, command: EditCommand) => void;

    /**
     * Defaults to `false`. If `true`, enables navigation between cells using left and right arrow keys within the editor.
     */
    editorCellNavOnLRKeys?: boolean;

    /**
     * Factory function for creating custom editors. Default is `null`.
     */
    editorFactory?: EditorFactory;

    /**
     * Global editor lock instance, used for managing concurrent editor access. Default is `GlobalEditorLock`.
     */
    editorLock?: EditorLock;

    /**
     * Defaults to `false`. If `true`, enables the ability to add new rows to the grid.
     */
    enableAddRow?: boolean;

    /**
     * Defaults to `false`. If `true`, enables asynchronous post-rendering.
     */
    enableAsyncPostRender?: boolean;

    /**
     * Defaults to `false`. If `true`, enables cleanup after asynchronous post-rendering.
     */
    enableAsyncPostRenderCleanup?: boolean;

    /**
     * Defaults to `true`. If `true`, enables cell navigation with arrow keys.
     */
    enableCellNavigation?: boolean;

    /**
     * Defaults to `false`. If `true`, allows selection of cell ranges.
     */
    enableCellRangeSelection?: boolean;

    /**
     * Defaults to `true`. If `true`, enables column reordering.
     */
    enableColumnReorder?: boolean;

    /**
     * Allow returning raw HTML strings from formatters and use `innerHTML` to render them. Defaults to `false` for tighter security.
     * It is recommended to leave this as `false` for better security and to avoid XSS vulnerabilities. In that case, formatters should return plain text or DOM elements.
     */
    enableHtmlRendering?: boolean;

    /**
     * Defaults to `false`. If `true`, enables row reordering.
     */
    enableRowReordering?: boolean;

    /**
     * Defaults to `true`. If `true`, enables navigation between cells using the Tab key.
     */
    enableTabKeyNavigation?: boolean;

    /**
     * Defaults to `false`. If `true`, enables text selection within cells.
     */
    enableTextSelectionOnCells?: boolean;

    /**
     * Defaults to `false`. If `true`, requires explicit initialization of the grid.
     */
    explicitInitialization?: boolean;

    /**
     * Defaults to `30`. Height of the footer row in pixels.
     */
    footerRowHeight?: number;

    /**
     * Defaults to `false`. If `true`, forces columns to fit the grid width.
     */
    forceFitColumns?: boolean;

    /**
     * Defaults to `false`. If `true`, synchronizes scrolling between the grid and its container.
     */
    forceSyncScrolling?: boolean;

    /**
     * Defaults to `250`. Interval in milliseconds for synchronizing scrolling when `forceSyncScrolling` is enabled.
     */
    forceSyncScrollInterval?: number;

    /**
     * Factory function for creating custom formatters. Default is `null`.
     */
    formatterFactory?: FormatterFactory;

    /**
     * Defaults to `false`. If `true`, places frozen rows at the bottom edge of the grid.
     */
    frozenBottom?: boolean;

    /**
     * Defaults to `undefined`. If specified, freezes the given number of columns on the left edge of the grid.
     * Prefer setting column.frozen = 'true' for individual columns as this is only for compatibility.
     */
    frozenColumns?: number;

    /**
     * Defaults to `undefined`. If specified, freezes the given number of rows at the top or bottom
     * edge of the grid based on `frozenBottom`.
     */
    frozenRows?: number;

    /**
     * Defaults to `false`. If `true`, makes rows take the full width of the grid.
     */
    fullWidthRows?: boolean;

    /**
     * Defaults to `false`. If `true`, shows the grouping panel for grouping columns.
     */
    groupingPanel?: boolean;

    /**
     * Defaults to `30`. Height of the grouping panel in pixels.
     */
    groupingPanelHeight?: number;

    /**
     * Function to format group totals for display in the grouping panel.
     */
    groupTotalsFormat?: (ctx: FormatterContext<IGroupTotals<TItem>>) => FormatterResult;

    /**
     * Function to format group totals for display in the grouping panel.
     * @deprecated Use `groupTotalsFormat` with `FormatterContext<IGroupTotals>` signature instead.
     */
    groupTotalsFormatter?: (totals?: IGroupTotals<TItem>, column?: Column<TItem>, grid?: any) => string;

    /**
     * Defaults to `30`. Height of the header row in pixels.
     */
    headerRowHeight?: number;

    /**
     * jQuery object for compatibility or custom integration purposes. Default is `undefined` unless jQuery is available in the global object (e.g. window).
     */
    jQuery?: { ready: any, fn: any };

    /**
     * Defaults to `false`. If `true`, leaves space for new rows in the DOM visible buffer.
     */
    leaveSpaceForNewRows?: boolean;

    /**
     * Layout engine for custom grid layouts. Default is `BasicLayout`. Use FrozenLayout to enable frozen columns / rows.
     */
    layoutEngine?: LayoutEngine;

    /**
     * Defaults to `3`. Minimum number of rows to keep in the buffer.
     */
    minBuffer?: number;

    /**
     * Defaults to `false`. If `true`, allows sorting by multiple columns simultaneously.
     */
    multiColumnSort?: boolean;

    /**
     * Defaults to `true`. If `true`, enables multiple cell selection.
     */
    multiSelect?: boolean;

    /**
     * Sets grouping panel height. Default is `undefined`, e.g. it is set via CSS.
     */
    preHeaderPanelHeight?: number;

    /**
     * Defaults to `false`. If `true`, renders all cells (row columns) in the viewport, at the cost of higher memory usage and reduced performance.
     */
    renderAllCells?: boolean;

    /**
     * Defaults to `false`. If `true`, renders all rows in the viewport, at the cost of higher memory usage and reduced performance.
     * When both renderAllCells and renderAllRows are true, all cells in the grid are rendered (e.g. virtualization is disabled),
     * which can be very slow for large datasets, but may be desired to keep all rows and cells in the DOM for accessibility purposes,
     * proper tabbing and screen reader support.
     */
    renderAllRows?: boolean;

    /**
     * Function to handle removing a DOM node, used for custom cleanup logic. Default is `null` or jQuery.remove if available.
     */
    removeNode?: (node: Element) => void;

    /**
     * Defaults to `30`. Height of rows in pixels.
     */
    rowHeight?: number;

    /**
     * Default is based on document element's (`<html/>`) `dir` property.. If `true`, enables right-to-left text direction.
     */
    rtl?: boolean;

    /**
     * Optional function for sanitizing HTML strings to avoid XSS attacks.
     * Default is `DOMPurify.sanitize` if available globally, otherwise falls back to `basicDOMSanitizer`.
     */
    sanitizer?: (dirtyHtml: string) => string;

    /**
     * CSS class applied to selected cells. Default is `"selected"`.
     */
    selectedCellCssClass?: string;

    /**
     * Defaults to `true`. If `true`, shows cell selection indicators.
     */
    showCellSelection?: boolean;

    /**
     * Defaults to `true`. If `true`, displays the column header.
     */
    showColumnHeader?: boolean;

    /**
     * Defaults to `false`. If `true`, displays the footer row.
     */
    showFooterRow?: boolean;

    /**
     * Defaults to `true`. If `true`, displays the grouping panel.
     */
    showGroupingPanel?: boolean;

    /**
     * Defaults to `false`. If `true`, displays the header row.
     */
    showHeaderRow?: boolean;

    /**
     * Defaults to `false`. If `true`, displays the pre-header panel for column grouping.
     */
    showPreHeaderPanel?: boolean;

    /**
     * Defaults to `false`. If `true`, displays the top panel for additional controls or information.
     */
    showTopPanel?: boolean;

    /**
     * Defaults to `false`. If `true`, suppresses the activation of cells when they contain an editor and are clicked.
     */
    suppressActiveCellChangeOnEdit?: boolean;

    /**
     * Defaults to `false`. If `true`, synchronizes column resizing with cell resizing.
     */
    syncColumnCellResize?: boolean;

    /**
     * Defaults to `30`. Height of the top panel in pixels.
     */
    topPanelHeight?: number;

    /**
     * Defaults to `false`. If `true`, uses legacy jQuery UI classes like ui-state-default and ui-widget-content.
     */
    useLegacyUI?: boolean;

    /**
     * Defaults to `false`. If `true`, uses CSS variables for styling.
     */
    useCssVars?: boolean;

    /**
     * CSS class applied to the viewport container. Default is `undefined`.
     */
    viewportClass?: string;

}

export const gridDefaults: GridOptions = {
    addNewRowCssClass: "new-row",
    alwaysAllowHorizontalScroll: false,
    alwaysShowVerticalScroll: false,
    asyncEditorLoadDelay: 100,
    asyncEditorLoading: false,
    asyncPostCleanupDelay: 40,
    asyncPostRenderDelay: -1,
    autoEdit: true,
    autoHeight: false,
    cellFlashingCssClass: "flashing",
    dataItemColumnValueExtractor: null,
    defaultColumnWidth: 80,
    defaultFormat: defaultColumnFormat,
    editable: false,
    editorFactory: null,
    editorLock: GlobalEditorLock,
    enableAddRow: false,
    enableAsyncPostRender: false,
    enableAsyncPostRenderCleanup: false,
    enableCellNavigation: true,
    enableColumnReorder: true,
    enableHtmlRendering: false,
    enableTabKeyNavigation: true,
    enableTextSelectionOnCells: false,
    explicitInitialization: false,
    footerRowHeight: 30,
    forceFitColumns: false,
    forceSyncScrolling: false,
    forceSyncScrollInterval: 250,
    formatterFactory: null,
    fullWidthRows: false,
    groupingPanel: false,
    groupingPanelHeight: 30,
    headerRowHeight: 30,
    leaveSpaceForNewRows: false,
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
    topPanelHeight: 30,
    useLegacyUI: false,
    useCssVars: false
}
