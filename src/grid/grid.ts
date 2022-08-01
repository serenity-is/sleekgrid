import { attrEncode, htmlEncode, EditController, EditorLock, Event, IEventData, EventData, keyCode, GroupTotals, NonDataRow, preClickClassName, Range } from "../core/index";
import { Column, columnDefaults, ColumnMetadata, ColumnSort, ItemMetadata } from "./column";
import { EditCommand, Editor } from "./editor";
import type { CellStylesHash, ColumnFormatter, FormatterResult } from "./formatting";
import { addUiStateHover, adjustFrozenColumnCompat, CachedRow, disableSelection, getMaxSupportedCssHeight, getScrollBarDimensions, GoToResult, H, PostProcessCleanupEntry, removeUiStateHover, simpleArrayEquals, sortToDesiredOrderAndKeepRest, spacerDiv } from "./internal";
import { IPlugin, Position, RowCell, SelectionModel, ViewRange } from "./types";
import { ArgsCell, ArgsGrid, ArgsAddNewRow, ArgsEditorDestroy, ArgsCellEdit, ArgsColumnNode, ArgsCellChange, ArgsCssStyle, ArgsColumn, ArgsScroll, ArgsSelectedRowsChange, ArgsSort, ArgsValidationError } from "./eventargs";
import { gridDefaults, GridOptions } from "./gridoptions";
import { Layout } from "./layout";


export class Grid<TItem = any> {
    private _hasJQuery = typeof jQuery !== "undefined";

    private _absoluteColMinWidth: number;
    private _activeCanvasNode: HTMLElement;
    private _activeCell: number;
    private _activeCellNode: HTMLElement = null;
    private _activePosX: number;
    private _activeRow: number;
    private _activeViewportNode: HTMLElement;
    private _actualFrozenRow: number = -1;
    private _canvasWidth: number;
    private _cellCssClasses: CellStylesHash = {};
    private _cellHeightDiff: number = 0;
    private _cellWidthDiff: number = 0;
    private _colById: { [key: string]: number };
    private _colDefaults: Partial<Column>;
    private _colLeft: number[] = [];
    private _colRight: number[] = [];
    private _cols: Column<TItem>[];
    private _columnCssRulesL: any;
    private _columnCssRulesR: any;
    private _currentEditor: Editor = null;
    private _data: any;
    private _editController: EditController;
    private _frozenCols: number;
    private _footerRowH: number = 0;
    private _groupingPanelH: number = 0;
    private _frozenRows: number;
    private _headerColumnWidthDiff: number = 0;
    private _headerRowH: number = 0;
    private _hEditorLoader: number = null;
    private _hPostRender: number = null;
    private _hPostRenderCleanup: number = null;
    private _hRender: number = null;
    private _ignoreScrollUntil: number = 0;
    private _initColById: { [key: string]: number };
    private _initCols: Column<TItem>[];
    private _initialized = false;
    private _jumpinessCoefficient: number;
    private _layout: Layout;
    private _numberOfPages: number;
    private _numVisibleRows: number = 0;
    private _options: GridOptions<TItem>;
    private _page: number = 0;
    private _pageHeight: number;
    private _pageOffset: number = 0;
    private _pagingActive: boolean = false;
    private _pagingIsLastPage: boolean = false;
    private _plugins: IPlugin[] = [];
    private _postProcessCleanupQueue: PostProcessCleanupEntry[] = [];
    private _postProcessedRows: any = {};
    private _postProcessFromRow: number = null;
    private _postProcessGroupId: number = 0;
    private _postProcessToRow: number = null;
    private _realScrollHeight: number;
    private _rowsCache: { [key: number]: CachedRow } = {};
    private _rtl = false;
    private _rtlE = 'right';
    private _rtlS = 'left';
    private _scrollDims: { width: number, height: number };
    private _scrollLeft: number = 0;
    private _scrollLeftPrev: number = 0;
    private _scrollLeftRendered: number = 0;
    private _scrollTop: number = 0;
    private _scrollTopPrev: number = 0;
    private _scrollTopRendered: number = 0;
    private _selectedRows: number[] = [];
    private _selectionModel: SelectionModel;
    private _serializedEditorValue: any;
    private _sortColumns: ColumnSort[] = [];
    private _styleNode: HTMLStyleElement;
    private _stylesheet: any;
    private _tabbingDirection: number = 1;
    private _topPanelH: number = 0;
    private _uid: string = "sleekgrid_" + Math.round(1000000 * Math.random());
    private _uisd: string;
    private _viewportH: number;
    private _viewportHasHScroll: boolean;
    private _viewportHasVScroll: boolean;
    private _viewportTopH: number = 0;
    private _viewportW: number;
    private _virtualHeight: number;
    private _vScrollDir: number = 1;

    private _boundAncestorScroll: HTMLElement[] = [];
    private _container: HTMLElement;
    private _focusSink1: HTMLDivElement;
    private _focusSink2: HTMLDivElement;
    private _groupingPanel: HTMLDivElement;
    private _scrollContainerX: HTMLDivElement;
    private _scrollContainerY: HTMLDivElement;

    readonly onActiveCellChanged = new Event<ArgsCell>();
    readonly onActiveCellPositionChanged = new Event<ArgsGrid>();
    readonly onAddNewRow = new Event<ArgsAddNewRow>();
    readonly onBeforeCellEditorDestroy = new Event<ArgsEditorDestroy>();
    readonly onBeforeDestroy = new Event<ArgsGrid>();
    readonly onBeforeEditCell = new Event<ArgsCellEdit>();
    readonly onBeforeFooterRowCellDestroy = new Event<ArgsColumnNode>();
    readonly onBeforeHeaderCellDestroy = new Event<ArgsColumnNode>();
    readonly onBeforeHeaderRowCellDestroy = new Event<ArgsColumnNode>();
    readonly onCellChange = new Event<ArgsCellChange>();
    readonly onCellCssStylesChanged = new Event<ArgsCssStyle>();
    readonly onClick = new Event<ArgsCell, JQueryMouseEventObject>();
    readonly onColumnsReordered = new Event<ArgsGrid>();
    readonly onColumnsResized = new Event<ArgsGrid>();
    readonly onCompositeEditorChange = new Event<ArgsGrid>();
    readonly onContextMenu = new Event<ArgsGrid, JQueryEventObject>();
    readonly onDblClick = new Event<ArgsCell, JQueryMouseEventObject>();
    readonly onDrag = new Event<ArgsGrid, JQueryEventObject>();
    readonly onDragEnd = new Event<ArgsGrid, JQueryEventObject>();
    readonly onDragInit = new Event<ArgsGrid, JQueryEventObject>();
    readonly onDragStart = new Event<ArgsGrid, JQueryEventObject>();
    readonly onFooterRowCellRendered = new Event<ArgsColumnNode>();
    readonly onHeaderCellRendered = new Event<ArgsColumnNode>();
    readonly onHeaderClick = new Event<ArgsColumn>();
    readonly onHeaderContextMenu = new Event<ArgsColumn>();
    readonly onHeaderMouseEnter = new Event<ArgsColumn, MouseEvent>();
    readonly onHeaderMouseLeave = new Event<ArgsColumn, MouseEvent>();
    readonly onHeaderRowCellRendered = new Event<ArgsColumnNode>();
    readonly onKeyDown = new Event<ArgsCell, JQueryKeyEventObject>();
    readonly onMouseEnter = new Event<ArgsGrid, MouseEvent>();
    readonly onMouseLeave = new Event<ArgsGrid, MouseEvent>();
    readonly onScroll = new Event<ArgsScroll>();
    readonly onSelectedRowsChanged = new Event<ArgsSelectedRowsChange>();
    readonly onSort = new Event<ArgsSort>();
    readonly onValidationError = new Event<ArgsValidationError>();
    readonly onViewportChanged = new Event<ArgsGrid>();

    constructor(container: JQuery | HTMLElement, data: any, columns: Column<TItem>[], options: GridOptions<TItem>) {

        this._data = data;

        // settings


        this._colDefaults = Object.assign({}, columnDefaults);

        //////////////////////////////////////////////////////////////////////////////////////////////
        // Initialization

        if (this._hasJQuery && container instanceof jQuery)
            this._container = container[0];
        else if (container instanceof Element)
            this._container = container as HTMLElement;
        else if (typeof container === "string")
            this._container = document.querySelector(container);

        if (this._container == null) {
            throw new Error("SleekGrid requires a valid container, " + container + " does not exist in the DOM.");
        }

        this._container.classList.add('slick-container');

        this._rtl = document.body.classList.contains('rtl') || (typeof getComputedStyle != "undefined" &&
            getComputedStyle(this._container).direction == 'rtl');
        if (this._rtl) {
            this._rtlS = 'right';
            this._rtlE = 'left';
        }

        if (options?.createPreHeaderPanel) {
            // for compat, as draggable grouping plugin expects preHeaderPanel for grouping
            if (options.groupingPanel == null)
                options.groupingPanel = true;
            if (options.groupingPanelHeight == null && options.preHeaderPanelHeight != null)
                options.groupingPanelHeight = options.preHeaderPanelHeight;
            if (options.showGroupingPanel == null && options.showPreHeaderPanel != null)
                options.showGroupingPanel = options.showPreHeaderPanel;
        }

        options = Object.assign({}, gridDefaults, options);
        this._options = options;
        this.validateAndEnforceOptions();
        this._colDefaults.width = options.defaultColumnWidth;

        adjustFrozenColumnCompat(columns, this._options);
        this.setInitialCols(columns);
        this.adjustFrozenRowOption();

        this._editController = {
            "commitCurrentEdit": this.commitCurrentEdit.bind(this),
            "cancelCurrentEdit": this.cancelCurrentEdit.bind(this)
        };

        if (this._hasJQuery)
            $(this._container).empty();
        else
            this._container.innerHTML = '';

        this._container.style.overflow = "hidden";
        this._container.style.outline = "0";
        this._container.classList.add(this._uid);

        if (this._options.useLegacyUI)
            this._container.classList.add("ui-widget");

        // set up a positioning container if needed
        if (!/relative|absolute|fixed/.test(getComputedStyle(this._container).position)) {
            this._container.style.position = "relative";
        }

        this._container.appendChild(this._focusSink1 = H('div', {
            class: "slick-focus-sink",
            hideFocus: '',
            style: 'position:fixed;width:0!important;height:0!important;top:0;left:0;outline:0!important;',
            tabIndex: '0'
        }));

        if (options.groupingPanel) {
            this._container.appendChild(this._groupingPanel = H('div', {
                class: "slick-grouping-panel",
                style: "overflow:hidden; position:relative;" + (!options.showGroupingPanel ? " display: none" : "")
            }));

            if (options.createPreHeaderPanel) {
                this._groupingPanel.appendChild(H('div', { class: 'slick-preheader-panel' }));
            }
        }

        this._uisd = this._options.useLegacyUI ? ' ui-state-default' : '';
        this._layout = (this._frozenCols > 0 || this._frozenRows) > 0 ? this.frozenLayout() : this.basicLayout();
        this._container.append(this._focusSink2 = this._focusSink1.cloneNode() as HTMLDivElement);

        if (options.viewportClass)
            this.getViewports().forEach(vp => vp.classList.add(options.viewportClass,));

        if (!options.explicitInitialization) {
            this.init();
        }

        this.bindToData();
    }

    init(): void {
        if (this._initialized)
            return;

        this._initialized = true;

        this.getViewportWidth();
        this.getViewportHeight();

        // header columns and cells may have different padding/border skewing width calculations (box-sizing, hello?)
        // calculate the diff so we can set consistent sizes
        this.measureCellPaddingAndBorder();

        var viewports = this.getViewports();

        if (this._hasJQuery && !this._options.enableTextSelectionOnCells) {
            // disable text selection in grid cells except in input and textarea elements
            // (this is IE-specific, because selectstart event will only fire in IE)
            $(viewports).on("selectstart.ui", function () {
                return $(this).is("input,textarea");
            });
        }

        this._layout.setPaneVisibility();
        this._layout.setScroller();
        this.setOverflow();

        this.updateViewColLeftRight();
        this.createColumnHeaders();
        this.createColumnFooters();
        this.setupColumnSort();
        this.createCssRules();
        this.resizeCanvas();
        this._layout.bindAncestorScrollEvents();

        this._container.addEventListener("resize", this.resizeCanvas);

        viewports.forEach(vp => vp.addEventListener("scroll", this.handleScroll.bind(this)));

        if (this._hasJQuery && ($.fn as any).mousewheel && (this.hasFrozenColumns() || this.hasFrozenRows())) {
            $(viewports).on("mousewheel", this.handleMouseWheel.bind(this));
        }

        this._layout.getHeaderCols().forEach(hs => {
            disableSelection(hs);
            hs.addEventListener("contextmenu", this.handleHeaderContextMenu.bind(this));
            hs.addEventListener("click", this.handleHeaderClick.bind(this));
            hs.addEventListener("mouseenter", e => (e.target as HTMLElement).closest(".slick-header-column") &&
                this.handleHeaderMouseEnter(e));
            hs.addEventListener("mouseleave", e => (e.target as HTMLElement).closest(".slick-header-column") &&
                this.handleHeaderMouseLeave(e));
        });

        this._layout.getHeaderRowCols().forEach(el => {
            el.parentElement.addEventListener('scroll', this.handleHeaderRowScroll);
            el.parentElement.addEventListener('scroll', this.handleHeaderRowScroll);
        });

        this._layout.getFooterRowCols().forEach(el => {
            el.parentElement.addEventListener('scroll', this.handleFooterRowScroll);
            el.parentElement.addEventListener('scroll', this.handleFooterRowScroll);
        });

        [this._focusSink1, this._focusSink2].forEach(fs => fs.addEventListener("keydown", this.handleKeyDown.bind(this)));

        var canvases = Array.from(this.getCanvases());
        canvases.forEach(canvas => {
            canvas.addEventListener("keydown", this.handleKeyDown.bind(this))
            canvas.addEventListener("click", this.handleClick.bind(this))
            canvas.addEventListener("dblclick", this.handleDblClick.bind(this))
            canvas.addEventListener("contextmenu", this.handleContextMenu.bind(this));
        });

        if (this._hasJQuery && ($.fn as any).drag) {
            $(canvases)
                .on("draginit", this.handleDragInit.bind(this))
                .on("dragstart", { distance: 3 }, this.handleDragStart.bind(this))
                .on("drag", this.handleDrag.bind(this))
                .on("dragend", this.handleDragEnd.bind(this))
        }

        canvases.forEach(canvas => {
            canvas.addEventListener("mouseenter", e => (e.target as HTMLElement).closest(".slick-cell") &&
                this.handleMouseEnter(e));
            canvas.addEventListener("mouseleave", e => (e.target as HTMLElement).closest(".slick-cell") &&
                this.handleMouseLeave(e));
        });

        // Work around http://crbug.com/312427.
        if (navigator.userAgent.toLowerCase().match(/webkit/) &&
            navigator.userAgent.toLowerCase().match(/macintosh/) &&
            this._hasJQuery) {
            $(canvases).on("mousewheel", this.handleMouseWheel.bind(this));
        }
    }

    private hasFrozenColumns(): boolean {
        return this._frozenCols > 0;
    }

    private hasFrozenRows(): boolean {
        return this._frozenRows > 0;
    }

    registerPlugin(plugin: IPlugin): void {
        this._plugins.unshift(plugin);
        plugin.init(this);
    }

    unregisterPlugin(plugin: IPlugin): void {
        for (var i = this._plugins.length; i >= 0; i--) {
            if (this._plugins[i] === plugin) {
                if (this._plugins[i].destroy) {
                    this._plugins[i].destroy();
                }
                this._plugins.splice(i, 1);
                break;
            }
        }
    }

    getPluginByName(name: string): IPlugin {
        for (var i = this._plugins.length - 1; i >= 0; i--) {
            if (this._plugins[i].pluginName === name)
                return this._plugins[i];
        }
    }

    setSelectionModel(model: SelectionModel): void {
        if (this._selectionModel) {
            this._selectionModel.onSelectedRangesChanged.unsubscribe(this.handleSelectedRangesChanged);
            if (this._selectionModel.destroy) {
                this._selectionModel.destroy();
            }
        }

        this._selectionModel = model;
        if (this._selectionModel) {
            this._selectionModel.init(this);
            this._selectionModel.onSelectedRangesChanged.subscribe(this.handleSelectedRangesChanged);
        }
    }

    getScrollBarDimensions(): { width: number; height: number; } {
        return this._scrollDims;
    }

    getDisplayedScrollbarDimensions(): { width: number; height: number; } {
        return {
            width: this._viewportHasVScroll ? this._scrollDims.width : 0,
            height: this._viewportHasHScroll ? this._scrollDims.height : 0
        };
    }

    getAbsoluteColumnMinWidth() {
        return this._absoluteColMinWidth;
    }

    getSelectionModel(): SelectionModel {
        return this._selectionModel;
    }

    private colIdOrIdxToCell(columnIdOrIdx: string | number): number
    {
        if (columnIdOrIdx == null)
            return null;

        if (typeof columnIdOrIdx !== "number")
            return this.getColumnIndex(columnIdOrIdx);

        return columnIdOrIdx;
    }

    getCanvasNode(columnIdOrIdx?: string | number, row?: number): HTMLDivElement {
        return this._layout.getCanvasNodeFor(row || 0, this.colIdOrIdxToCell(columnIdOrIdx || 0));
    }

    getCanvases(): JQuery | HTMLDivElement[] {
        var canvases = this._layout.getCanvasNodes();
        return this._hasJQuery ? $(canvases) : canvases;
    }

    getActiveCanvasNode(e?: IEventData): HTMLElement {
        this.setActiveCanvasNode(e);
        return this._activeCanvasNode;
    }

    setActiveCanvasNode(e?: IEventData): void {
        if (e) {
            this._activeCanvasNode = (e.target as HTMLElement).closest('.grid-canvas');
        }
    }

    getViewportNode(columnIdOrIdx?: string | number, row?: number): HTMLDivElement {
        return this._layout.getViewportNodeFor(row || 0, this.colIdOrIdxToCell(columnIdOrIdx || 0));
    }

    private getViewports(): HTMLDivElement[] {
        return this._layout.getViewportNodes();
    }

    getActiveViewportNode(e?: IEventData): HTMLElement {
        this.setActiveViewportNode(e);
        return this._activeViewportNode;
    }

    setActiveViewportNode(e?: IEventData) {
        if (e) {
            this._activeViewportNode = (e.target as HTMLElement).closest('.slick-viewport');
        }
    }

    private getAvailableWidth() {
        return this._viewportHasVScroll ? this._viewportW - this._scrollDims.width : this._viewportW;
    }

    private getCanvasWidth(): number {
        return this._layout.calcCanvasWidth();
    }

    private updateCanvasWidth(forceColumnWidthsUpdate?: boolean): void {
        const widthChanged = this._layout.updateCanvasWidth();

        if (widthChanged || forceColumnWidthsUpdate) {
            this._layout.applyColumnWidths();
        }
    }

    private unbindAncestorScrollEvents(): void {
        if (this._boundAncestorScroll) {
            for (var x of this._boundAncestorScroll)
                x.removeEventListener('scroll', this.handleActiveCellPositionChange);
        }
        this._boundAncestorScroll = [];
    }

    updateColumnHeader(columnId: string, title?: string, toolTip?: string): void {
        if (!this._initialized) {
            return;
        }

        var idx = this.getColumnIndex(columnId);
        if (idx == null) {
            return;
        }

        var columnDef = this._cols[idx];
        var header = this._layout.getHeaderColumn(idx);
        if (!header)
            return;

        if (title !== undefined) {
            columnDef.name = title;
        }
        if (toolTip !== undefined) {
            columnDef.toolTip = toolTip;
        }

        this.trigger(this.onBeforeHeaderCellDestroy, {
            node: header,
            column: columnDef
        });

        if (toolTip !== undefined)
            header.title = toolTip || "";

        if (title !== undefined) {
            var child = header.firstElementChild;
            if (columnDef.nameIsHtml)
                child && (child.innerHTML = title ?? '');
            else
                child && (child.textContent = title ?? '')
        }

        this.trigger(this.onHeaderCellRendered, {
            node: header,
            column: columnDef
        });
    }

    getHeader(): HTMLDivElement {
        return this._layout.getHeaderCols()[0];
    }

    getHeaderColumn(columnIdOrIdx: string | number): HTMLDivElement {
        var cell = this.colIdOrIdxToCell(columnIdOrIdx);
        if (cell == null)
            return null;

        return this._layout.getHeaderColumn(cell);
    }

    getGroupingPanel(): HTMLDivElement {
        return this._groupingPanel;
    }

    getPreHeaderPanel(): HTMLDivElement {
        return this._groupingPanel?.querySelector('.slick-preheader-panel');
    }

    getHeaderRow(): HTMLDivElement {
        return this._layout.getHeaderRowCols()[0];
    }

    getHeaderRowColumn(columnIdOrIdx: string | number): HTMLElement {
        var cell = this.colIdOrIdxToCell(columnIdOrIdx);
        if (cell == null)
            return;

        return this._layout.getHeaderRowColumn(cell);
    }

    getFooterRow(): HTMLDivElement {
        return this._layout.getFooterRowCols()[0];
    }

    getFooterRowColumn(columnIdOrIdx: string | number): HTMLElement {
        var cell = this.colIdOrIdxToCell(columnIdOrIdx);
        if (cell == null)
            return null;

        return this._layout.getFooterRowColumn(cell);
    }

    private createColumnFooters(): void {
        var footerRowCols = this._layout.getFooterRowCols();
        footerRowCols.forEach(frc => {
            frc.querySelectorAll(".slick-footerrow-column")
                .forEach((el) => {
                    var columnDef = this.getColumnFromNode(el);
                    if (columnDef) {
                        this.trigger(this.onBeforeFooterRowCellDestroy, {
                            node: el as HTMLElement,
                            column: columnDef
                        });
                    }
                })

            if (this._hasJQuery) {
                $(frc).empty();
            }
            else
                frc.innerHTML = '';
        });

        var cols = this._cols, frozenCols = this._frozenCols;
        for (var i = 0; i < cols.length; i++) {
            var m = cols[i];

            var footerRowCell = H("div", { class: "slick-footerrow-column l" + i + " r" + i + (this._options.useLegacyUI ? ' ui-state-default' : '') });
            footerRowCell.dataset.c = i.toString();
            this._hasJQuery && $(footerRowCell).data("column", m);

            if (m.footerCssClass)
                footerRowCell.classList.add(m.footerCssClass);
            else if (m.cssClass)
                footerRowCell.classList.add(m.cssClass);

            this._layout.getFooterRowColsFor(i).appendChild(footerRowCell);

            this.trigger(this.onFooterRowCellRendered, {
                node: footerRowCell,
                column: m
            });
        }
    }

    private formatGroupTotal(total: GroupTotals, columnDef: Column<TItem>): any {
        if (columnDef.formatter != null) {
            var item = new NonDataRow();
            item[columnDef.field] = total;
            try {
                return columnDef.formatter(-1, -1, total, columnDef, item as any);
            }
            catch (e) {
            }
        }

        //@ts-ignore
        if (typeof total == "number" && typeof Q !== "undefined" && Q.formatNumber) {
            if ((columnDef as any).sourceItem && (columnDef as any).sourceItem.displayFormat) {
                //@ts-ignore
                return Q.formatNumber(total, columnDef.sourceItem.displayFormat);
            }
            else
                //@ts-ignore
                return Q.formatNumber(total, "#,##0.##");
        }
        else
            return htmlEncode(total?.toString());
    }

    private groupTotalText(totals: GroupTotals, columnDef: Column<TItem>, key: string): string {
        var ltKey = (key.substring(0, 1).toUpperCase() + key.substring(1));
        //@ts-ignore
        var text = (typeof Q !== "undefined" && Q.tryGetText && Q.tryGetText(ltKey)) || ltKey;

        var total = totals[key][columnDef.field];
        total = this.formatGroupTotal(total, columnDef);

        return "<span class='aggregate agg-" + key + "'  title='" + text + "'>" +
            total +
            "</span>";
    }

    private groupTotalsFormatter(totals: GroupTotals, columnDef: Column<TItem>): string {
        if (!totals || !columnDef)
            return "";

        var text: string = null;
        var self = this;

        ["sum", "avg", "min", "max", "cnt"].forEach(function (key) {
            if (text == null && totals[key] && totals[key][columnDef.field] != null) {
                text = self.groupTotalText(totals, columnDef, key);
                return false;
            }
        });

        return text || "";
    }

    private createColumnHeaders(): void {
        const headerCols = this._layout.getHeaderCols();
        headerCols.forEach(hc => {
            hc.querySelectorAll(".slick-header-column")
                .forEach((el) => {
                    var columnDef = this.getColumnFromNode(el);
                    if (columnDef) {
                        this.trigger(this.onBeforeHeaderCellDestroy, {
                            node: el as HTMLElement,
                            column: columnDef
                        });
                    }
                });

            if (this._hasJQuery) {
                $(hc).empty();
            }
            else {
                hc.innerHTML = '';
            }
        });


        this._layout.calcHeaderWidths();

        var cols = this._cols, frozenCols = this._frozenCols;
        for (var i = 0; i < cols.length; i++) {
            var m = cols[i];

            var headerTarget = this._layout.getHeaderColsFor(i);

            var name = document.createElement("span");
            name.className = "slick-column-name";
            if (m.nameIsHtml)
                name.innerHTML = m.name ?? '';
            else
                name.textContent = m.name ?? '';
            var header = H("div", {
                class: "slick-header-column" + (this._options.useLegacyUI ? " ui-state-default " : ""),
                id: "" + this._uid + m.id,
                title: m.toolTip || "",
                style: "width: " + (m.width - this._headerColumnWidthDiff) + "px"
            }, name);

            header.dataset.c = i.toString();
            this._hasJQuery && $(header).data("column", m);

            m.headerCssClass && header.classList.add(m.headerCssClass);

            i < frozenCols && header.classList.add("frozen");

            headerTarget.appendChild(header);

            if ((this._options.enableColumnReorder || m.sortable) && this._options.useLegacyUI) {
                header.addEventListener('mouseenter', addUiStateHover);
                header.addEventListener('mouseleave', removeUiStateHover);
            }

            if (m.sortable) {
                header.classList.add("slick-header-sortable");
                header.appendChild(H("span", { class: "slick-sort-indicator" }));
            }

            this.trigger(this.onHeaderCellRendered, {
                node: header,
                column: m
            });

            if (this._options.showHeaderRow) {
                var headerRowTarget = this._layout.getHeaderRowColsFor(i);

                var headerRowCell = H("div", { class: "slick-headerrow-column l" + i + " r" + i + (this._options.useLegacyUI ? " ui-state-default" : "") });
                headerRowCell.dataset.c = i.toString();
                this._hasJQuery && $(headerRowCell).data("column", m);
                headerRowTarget.appendChild(headerRowCell);

                this.trigger(this.onHeaderRowCellRendered, {
                    node: headerRowCell,
                    column: m
                });
            }
        }

        this.setSortColumns(this._sortColumns);
        this.setupColumnResize();
        if (this._options.enableColumnReorder)
            this.setupColumnReorder();
    }

    private setupColumnSort(): void {
        this._layout.getHeaderCols().forEach(el => el.addEventListener("click", e => {

            var tgt = e.target as HTMLElement;
            if (tgt.classList.contains("slick-resizable-handle")) {
                return;
            }

            var colNode = tgt.closest(".slick-header-column");
            if (!colNode) {
                return;
            }

            var column = this.getColumnFromNode(colNode);
            if (column.sortable) {
                if (!this.getEditorLock().commitCurrentEdit()) {
                    return;
                }

                var sortOpts = null;
                var i = 0;
                for (; i < this._sortColumns.length; i++) {
                    if (this._sortColumns[i].columnId == column.id) {
                        sortOpts = this._sortColumns[i];
                        sortOpts.sortAsc = !sortOpts.sortAsc;
                        break;
                    }
                }

                if (e.metaKey && this._options.multiColumnSort) {
                    if (sortOpts) {
                        this._sortColumns.splice(i, 1);
                    }
                }
                else {
                    if ((!e.shiftKey && !e.metaKey) || !this._options.multiColumnSort) {
                        this._sortColumns = [];
                    }

                    if (!sortOpts) {
                        sortOpts = { columnId: column.id, sortAsc: column.defaultSortAsc };
                        this._sortColumns.push(sortOpts);
                    } else if (this._sortColumns.length == 0) {
                        this._sortColumns.push(sortOpts);
                    }
                }

                this.setSortColumns(this._sortColumns);

                if (!this._options.multiColumnSort) {
                    this.trigger(this.onSort, {
                        multiColumnSort: false,
                        sortCol: column,
                        sortAsc: sortOpts.sortAsc
                    }, e);
                } else {
                    var cols = this._initCols;
                    this.trigger(this.onSort, {
                        multiColumnSort: true,
                        sortCols: this._sortColumns.map(col => ({ sortCol: cols[this.getInitialColumnIndex(col.columnId)], sortAsc: col.sortAsc }))
                    }, e);
                }
            }
        }));
    }

    private setupColumnReorder(): void {
        if (this._hasJQuery)
            ($(this._layout.getHeaderCols()).filter(":ui-sortable") as any).sortable("destroy");
        var columnScrollTimer: number = null;

        var scrollColumnsRight = () => {
            this._scrollContainerX.scrollLeft = this._scrollContainerX.scrollLeft + 10;
        }

        var scrollColumnsLeft = () => {
            this._scrollContainerX.scrollLeft = this._scrollContainerX.scrollLeft - 10;
        }

        var canDragScroll: boolean;

        var hasGrouping = this._options.groupingPanel;
        ($([this._layout.getHeaderCols()]) as any).sortable({
            containment: hasGrouping ? undefined : "parent",
            distance: 3,
            axis: hasGrouping ? undefined : "x",
            cursor: "default",
            tolerance: "intersection",
            helper: "clone",
            placeholder: "slick-sortable-placeholder" + (this._options.useLegacyUI ? " ui-state-default" : "") + " slick-header-column",
            forcePlaceholderSize: hasGrouping ? true : undefined,
            appendTo: hasGrouping ? "body" : undefined,
            start: (_: any, ui: any) => {
                ui.placeholder.outerHeight(ui.helper.outerHeight());
                ui.placeholder.outerWidth(ui.helper.outerWidth());
                canDragScroll = !this.hasFrozenColumns() ||
                    (ui.placeholder.offset()[this._rtlS] + Math.round(ui.placeholder.width())) > $(this._scrollContainerX).offset()[this._rtlS];
                $(ui.helper).addClass("slick-header-column-active");
            },
            beforeStop: (_: any, ui: any) => {
                $(ui.helper).removeClass("slick-header-column-active");
                if (hasGrouping) {
                    var $headerDraggableGroupBy = $(this.getGroupingPanel());
                    var hasDroppedColumn = $headerDraggableGroupBy
                        .find(".slick-dropped-grouping").length;
                    if (hasDroppedColumn > 0) {
                        $headerDraggableGroupBy.find(".slick-dropped-placeholder").hide();
                        $headerDraggableGroupBy.find(".slick-dropped-grouping").show();
                    }
                }
            },
            sort: (e: JQueryEventObject) => {
                if (canDragScroll && (e.originalEvent as any).pageX > this._container.clientWidth) {
                    if (!(columnScrollTimer)) {
                        columnScrollTimer = setInterval(
                            scrollColumnsRight, 100);
                    }
                } else if (canDragScroll && (e.originalEvent as any).pageX < $(this._scrollContainerX).offset().left) {
                    if (!(columnScrollTimer)) {
                        columnScrollTimer = setInterval(
                            scrollColumnsLeft, 100);
                    }
                } else {
                    clearInterval(columnScrollTimer);
                    columnScrollTimer = null;
                }
            },
            stop: (e: any) => {
                var cancel = false;
                clearInterval(columnScrollTimer);
                columnScrollTimer = null;

                if (cancel || !this.getEditorLock().commitCurrentEdit()) {
                    ($(e.target) as any).sortable("cancel");
                    return;
                }

                var reorderedCols;
                this._layout.getHeaderCols().forEach(el =>
                    reorderedCols = sortToDesiredOrderAndKeepRest(this._initCols,
                        ($(el) as any).sortable("toArray").map((x: string) => x.substring(this._uid.length))));

                this.setColumns(reorderedCols);
                this.trigger(this.onColumnsReordered, {});
                e.stopPropagation();
                this.setupColumnResize();
            }
        });
    }

    private setupColumnResize(): void {

        var minPageX: number, pageX: number, maxPageX: number, cols = this._cols;
        var columnElements: Element[] = [];
        this._layout.getHeaderCols().forEach(el => {
            columnElements = columnElements.concat(Array.from(el.children));
        });

        var j: number, k: number, c: Column<TItem>, pageX: number, minPageX: number, maxPageX: number, firstResizable: number, lastResizable: number, cols = this._cols;
        var firstResizable: number, lastResizable: number;
        columnElements.forEach((el, i) => {
            el.querySelector(".slick-resizable-handle")?.remove();
            if (cols[i].resizable) {
                if (firstResizable === undefined) {
                    firstResizable = i;
                }
                lastResizable = i;
            }
        });

        if (firstResizable === undefined) {
            return;
        }

        const noJQueryDrag = !this._hasJQuery || !$.fn || !($.fn as any).drag;
        columnElements.forEach((el, i) => {

            if (i < firstResizable || (this._options.forceFitColumns && i >= lastResizable)) {
                return;
            }

            const handle = el.appendChild(document.createElement('div'));
            handle.classList.add('slick-resizable-handle');
            handle.draggable = true;

            var docDragOver: any = null;

            const dragStart = (e: DragEvent) => {
                if (!this.getEditorLock().commitCurrentEdit()) {
                    !noJQueryDrag && e.preventDefault();
                    return;
                }

                if (noJQueryDrag) {
                    docDragOver = (z: DragEvent) => z.preventDefault();
                    document.addEventListener('dragover', docDragOver);
                }

                pageX = e.pageX;
                (e.target as HTMLElement).parentElement?.classList.add("slick-header-column-active");
                var shrinkLeewayOnRight = null, stretchLeewayOnRight = null;
                // lock each column's width option to current width
                columnElements.forEach((e, i) => {
                    cols[i].previousWidth = (e as HTMLElement).offsetWidth;
                });
                if (this._options.forceFitColumns) {
                    shrinkLeewayOnRight = 0;
                    stretchLeewayOnRight = 0;
                    // colums on right affect maxPageX/minPageX
                    for (j = i + 1; j < columnElements.length; j++) {
                        c = cols[j];
                        if (c.resizable) {
                            if (stretchLeewayOnRight != null) {
                                if (c.maxWidth) {
                                    stretchLeewayOnRight += c.maxWidth - c.previousWidth;
                                } else {
                                    stretchLeewayOnRight = null;
                                }
                            }
                            shrinkLeewayOnRight += c.previousWidth - Math.max(c.minWidth || 0, this._absoluteColMinWidth);
                        }
                    }
                }
                var shrinkLeewayOnLeft = 0, stretchLeewayOnLeft = 0;
                for (j = 0; j <= i; j++) {
                    // columns on left only affect minPageX
                    c = cols[j];
                    if (c.resizable) {
                        if (stretchLeewayOnLeft != null) {
                            if (c.maxWidth) {
                                stretchLeewayOnLeft += c.maxWidth - c.previousWidth;
                            } else {
                                stretchLeewayOnLeft = null;
                            }
                        }
                        shrinkLeewayOnLeft += c.previousWidth - Math.max(c.minWidth || 0, this._absoluteColMinWidth);
                    }
                }
                if (shrinkLeewayOnRight === null) {
                    shrinkLeewayOnRight = 100000;
                }
                if (shrinkLeewayOnLeft === null) {
                    shrinkLeewayOnLeft = 100000;
                }
                if (stretchLeewayOnRight === null) {
                    stretchLeewayOnRight = 100000;
                }
                if (stretchLeewayOnLeft === null) {
                    stretchLeewayOnLeft = 100000;
                }
                maxPageX = pageX + Math.min(shrinkLeewayOnRight, stretchLeewayOnLeft);
                minPageX = pageX - Math.min(shrinkLeewayOnLeft, stretchLeewayOnRight);
                noJQueryDrag && (e.dataTransfer.effectAllowed = 'move');

            };

            const drag = (e: DragEvent) => {
                if (noJQueryDrag) {
                    if (!e.pageX && !e.clientX && !e.pageY && !e.clientY)
                        return;
                    e.dataTransfer.effectAllowed = 'none';
                    e.preventDefault();
                }
                var actualMinWidth, d = Math.min(maxPageX, Math.max(minPageX, e.pageX)) - pageX, x, j: number, k: number, c: Column;
                if (d < 0) { // shrink column
                    x = d;

                    for (j = i; j >= 0; j--) {
                        c = cols[j];
                        if (c.resizable) {
                            actualMinWidth = Math.max(c.minWidth || 0, this._absoluteColMinWidth);
                            if (x && c.previousWidth + x < actualMinWidth) {
                                x += c.previousWidth - actualMinWidth;
                                c.width = actualMinWidth;
                            } else {
                                c.width = c.previousWidth + x;
                                x = 0;
                            }
                        }
                    }

                    for (k = 0; k <= i; k++) {
                        c = cols[k];
                    }

                    if (this._options.forceFitColumns) {
                        x = -d;
                        for (j = i + 1; j < columnElements.length; j++) {
                            c = cols[j];
                            if (c.resizable) {
                                if (x && c.maxWidth && (c.maxWidth - c.previousWidth < x)) {
                                    x -= c.maxWidth - c.previousWidth;
                                    c.width = c.maxWidth;
                                } else {
                                    c.width = c.previousWidth + x;
                                    x = 0;
                                }
                            }
                        }
                    } else {
                        for (j = i + 1; j < columnElements.length; j++) {
                            c = cols[j];
                        }
                    }
                } else { // stretch column
                    x = d;

                    for (j = i; j >= 0; j--) {
                        c = cols[j];
                        if (c.resizable) {
                            if (x && c.maxWidth && (c.maxWidth - c.previousWidth < x)) {
                                x -= c.maxWidth - c.previousWidth;
                                c.width = c.maxWidth;
                            } else {
                                c.width = c.previousWidth + x;
                                x = 0;
                            }
                        }
                    }

                    for (k = 0; k <= i; k++) {
                        c = cols[k];
                    }

                    if (this._options.forceFitColumns) {
                        x = -d;
                        for (j = i + 1; j < columnElements.length; j++) {
                            c = cols[j];
                            if (c.resizable) {
                                actualMinWidth = Math.max(c.minWidth || 0, this._absoluteColMinWidth);
                                if (x && c.previousWidth + x < actualMinWidth) {
                                    x += c.previousWidth - actualMinWidth;
                                    c.width = actualMinWidth;

                                } else {
                                    c.width = c.previousWidth + x;
                                    x = 0;
                                }
                            }
                        }
                    } else {
                        for (j = i + 1; j < columnElements.length; j++) {
                            c = cols[j];
                        }
                    }
                }

                this._layout.afterHeaderColumnDrag();

                this.applyColumnHeaderWidths();
                if (this._options.syncColumnCellResize) {
                    this._layout.applyColumnWidths();
                }
            }

            const dragEnd = (e: any) => {
                if (docDragOver) {
                    document.removeEventListener('dragover', docDragOver);
                    docDragOver = null;
                }
                (e.target.parentElement as HTMLElement)?.classList.remove("slick-header-column-active");
                for (j = 0; j < columnElements.length; j++) {
                    c = cols[j];
                    var newWidth = (columnElements[j] as HTMLElement).offsetWidth;

                    if (c.previousWidth !== newWidth && c.rerenderOnResize) {
                        this.invalidateAllRows();
                    }
                }
                this.updateCanvasWidth(true);
                this.render();
                this.trigger(this.onColumnsResized);
            }

            if (noJQueryDrag) {
                handle.addEventListener("dragstart", dragStart);
                handle.addEventListener("drag", drag);
                handle.addEventListener("dragend", dragEnd);
                handle.addEventListener("dragover", (e: any) => { e.preventDefault(); e.dataTransfer.effectAllowed = "move"; });
            }
            else {
                ($(handle) as any)
                    .on("dragstart", dragStart)
                    .on("drag", drag)
                    .on("dragend", dragEnd);
            }
        });
    }

    private getVBoxDelta(el: HTMLElement): number {
        var style = getComputedStyle(el);
        if (style.boxSizing == 'border-box')
            return 0;

        var p = ["border-top-width", "border-bottom-width", "padding-top", "padding-bottom"];
        var delta = 0;
        p.forEach(val => delta += parseFloat(style.getPropertyValue(val)) || 0);
        return delta;
    }

    private adjustFrozenRowOption(): void {
        if (this._options.autoHeight) {
            this._frozenRows = 0;
            return;
        }

        this._frozenRows = (this._options.frozenRows > 0 && this._options.frozenRows <= this._numVisibleRows) ? this._options.frozenRows : 0;

        if (this._frozenRows) {
            this._actualFrozenRow = (this._options.frozenBottom) ? (this.getDataLength() - this._frozenRows) : (this._frozenRows);
        }
    }

    private setOverflow(): void {
        this._layout.setOverflow();
        if (this._options.viewportClass)
            this.getViewports().forEach(vp => vp.classList.add(this._options.viewportClass));
    }

    private measureCellPaddingAndBorder(): void {
        const h = ["border-left-width", "border-right-width", "padding-left", "padding-right"];
        const v = ["border-top-width", "border-bottom-width", "padding-top", "padding-bottom"];

        var el = this._layout.getHeaderColsFor(0).appendChild(H("div", { class: "slick-header-column" + (this._options.useLegacyUI ? " ui-state-default" : ""), style: "visibility:hidden" }));
        this._headerColumnWidthDiff = 0;
        var cs = getComputedStyle(el);
        if (cs.boxSizing != "border-box")
            h.forEach(val => this._headerColumnWidthDiff += parseFloat(cs.getPropertyValue(val)) || 0);
        el.remove();

        var r = this._layout.getCanvasNodeFor(0, 0).appendChild(H("div", { class: "slick-row" },
            el = H("div", { class: "slick-cell", id: "", style: "visibility: hidden" })));
        el.innerHTML = "-";
        this._cellWidthDiff = this._cellHeightDiff = 0;
        cs = getComputedStyle(el);
        if (cs.boxSizing != "border-box") {
            h.forEach(val => this._cellWidthDiff += parseFloat(cs.getPropertyValue(val)) || 0);
            v.forEach(val => this._cellHeightDiff += parseFloat(cs.getPropertyValue(val)) || 0);
        }
        r.remove();

        this._absoluteColMinWidth = Math.max(this._headerColumnWidthDiff, this._cellWidthDiff);
    }

    private createCssRules() {
        var el = this._styleNode = document.createElement('style');
        el.dataset.uid = this._uid;
        var rowHeight = (this._options.rowHeight - this._cellHeightDiff);
        var rules = [
            "." + this._uid + " { --slick-cell-height: " + this._options.rowHeight + "px; }",
            "." + this._uid + " .slick-group-header-column { " + this._rtlS + ": 1000px; }",
            "." + this._uid + " .slick-header-column { " + this._rtlS + ": 1000px; }",
            "." + this._uid + " .slick-top-panel { height:" + this._options.topPanelHeight + "px; }",
            "." + this._uid + " .slick-grouping-panel { height:" + this._options.groupingPanelHeight + "px; }",
            "." + this._uid + " .slick-headerrow-columns { height:" + this._options.headerRowHeight + "px; }",
            "." + this._uid + " .slick-cell { height:" + rowHeight + "px; }",
            "." + this._uid + " .slick-row { height:" + this._options.rowHeight + "px; }",
            "." + this._uid + " .slick-footerrow-columns { height:" + this._options.footerRowHeight + "px; }",
        ];

        var cols = this._cols;
        for (var i = 0; i < cols.length; i++) {
            rules.push("." + this._uid + " .l" + i + " { }");
            rules.push("." + this._uid + " .r" + i + " { }");
        }

        el.appendChild(document.createTextNode(rules.join(" ")));
        document.head.appendChild(el);
    }

    private getColumnCssRules(idx: number): { right: any; left: any; } {
        if (!this._stylesheet) {
            var stylesheetFromUid = document.querySelector("style[data-uid='" + this._uid + "']") as any
            if (stylesheetFromUid && stylesheetFromUid.sheet) {
                this._stylesheet = stylesheetFromUid.sheet;
            } else {
                var sheets = document.styleSheets;
                for (var i = 0; i < sheets.length; i++) {
                    if ((sheets[i].ownerNode || (sheets[i] as any).owningElement) == this._styleNode) {
                        this._stylesheet = sheets[i];
                        break;
                    }
                }
            }

            if (!this._stylesheet) {
                throw new Error("Cannot find stylesheet.");
            }

            // find and cache column CSS rules
            this._columnCssRulesL = [];
            this._columnCssRulesR = [];
            var cssRules = (this._stylesheet.cssRules || this._stylesheet.rules);
            var matches, columnIdx;
            for (var i = 0; i < cssRules.length; i++) {
                var selector = cssRules[i].selectorText;
                if (matches = /\.l\d+/.exec(selector)) {
                    columnIdx = parseInt(matches[0].substring(2, matches[0].length), 10);
                    this._columnCssRulesL[columnIdx] = cssRules[i];
                } else if (matches = /\.r\d+/.exec(selector)) {
                    columnIdx = parseInt(matches[0].substring(2, matches[0].length), 10);
                    this._columnCssRulesR[columnIdx] = cssRules[i];
                }
            }
        }

        return this._rtl ? {
            "right": this._columnCssRulesL[idx],
            "left": this._columnCssRulesR[idx]
        } : {
            "left": this._columnCssRulesL[idx],
            "right": this._columnCssRulesR[idx]
        }
    }

    private removeCssRules() {
        this._styleNode.remove();
        this._stylesheet = null;
    }

    destroy() {
        this.getEditorLock().cancelCurrentEdit();

        this.trigger(this.onBeforeDestroy);

        var i = this._plugins.length;
        while (i--) {
            this.unregisterPlugin(this._plugins[i]);
        }

        if (this._options.enableColumnReorder && this._hasJQuery) {
            ($(this._layout.getHeaderCols()).filter(":ui-sortable") as any).sortable("destroy");
        }

        this.unbindAncestorScrollEvents();
        $(this._container).off(".slickgrid");
        this.removeCssRules();

        var canvasNodes = this._layout.getCanvasNodes();
        if (this._hasJQuery)
            $(canvasNodes).off("draginit dragstart dragend drag");
        else
            canvasNodes.forEach(el => el.remove());

        for (var k in this) {
            if (!Object.prototype.hasOwnProperty.call(this, k))
                continue;
            if (k.startsWith('on')) {
                var ev: any = this[k];
                if ((ev as Event)?.clear && (ev as Event)?.subscribe)
                    (ev as Event)?.clear();
            }
            delete this[k];
        }
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    // General

    private trigger<TArgs extends ArgsGrid, TEventData extends IEventData = IEventData>(
        evt: Event<TArgs, TEventData>, args?: TArgs, e?: TEventData) {
        e = e || new EventData() as any;
        args = args || {} as any;
        args.grid = this;
        return evt.notify(args, e, this);
    }

    getEditorLock(): EditorLock {
        return this._options.editorLock;
    }

    getEditController(): EditController {
        return this._editController;
    }

    getColumnIndex(id: string): number {
        return this._colById[id];
    }

    getInitialColumnIndex(id: string): number {
        return this._initColById[id];
    }

    autosizeColumns(): void {
        var i, c,
            widths = [],
            shrinkLeeway = 0,
            total = 0,
            prevTotal,
            availWidth = this._viewportHasVScroll ? this._viewportW - this._scrollDims.width : this._viewportW,
            cols = this._cols;

        for (i = 0; i < cols.length; i++) {
            c = cols[i];
            widths.push(c.width);
            total += c.width;
            if (c.resizable) {
                shrinkLeeway += c.width - Math.max(c.minWidth, this._absoluteColMinWidth);
            }
        }

        // shrink
        prevTotal = total;
        while (total > availWidth && shrinkLeeway) {
            var shrinkProportion = (total - availWidth) / shrinkLeeway;
            for (i = 0; i < cols.length && total > availWidth; i++) {
                c = cols[i];
                var width = widths[i];
                if (!c.resizable || width <= c.minWidth || width <= this._absoluteColMinWidth) {
                    continue;
                }
                var absMinWidth = Math.max(c.minWidth, this._absoluteColMinWidth);
                var shrinkSize = Math.floor(shrinkProportion * (width - absMinWidth)) || 1;
                shrinkSize = Math.min(shrinkSize, width - absMinWidth);
                total -= shrinkSize;
                shrinkLeeway -= shrinkSize;
                widths[i] -= shrinkSize;
            }
            if (prevTotal <= total) {  // avoid infinite loop
                break;
            }
            prevTotal = total;
        }

        // grow
        prevTotal = total;
        while (total < availWidth) {
            var growProportion = availWidth / total;
            for (i = 0; i < cols.length && total < availWidth; i++) {
                c = cols[i];
                var currentWidth = widths[i];
                var growSize;

                if (!c.resizable || c.maxWidth <= currentWidth) {
                    growSize = 0;
                } else {
                    growSize = Math.min(Math.floor(growProportion * currentWidth) - currentWidth, (c.maxWidth - currentWidth) || 1000000) || 1;
                }
                total += growSize;
                widths[i] += (total <= availWidth ? growSize : 0);
            }
            if (prevTotal >= total) {  // avoid infinite loop
                break;
            }
            prevTotal = total;
        }

        var reRender = false;
        for (i = 0; i < cols.length; i++) {
            if (cols[i].rerenderOnResize && cols[i].width != widths[i]) {
                reRender = true;
            }
            cols[i].width = widths[i];
        }

        this.applyColumnHeaderWidths();
        this.updateCanvasWidth(true);
        if (reRender) {
            this.invalidateAllRows();
            this.render();
        }
    }

    private applyColumnHeaderWidths(): void {
        if (!this._initialized) { return; }

        var h: HTMLElement;
        for (var i = 0, cols = this._cols, ii = cols.length, diff = this._headerColumnWidthDiff; i++; i < ii) {
            h = this._layout.getHeaderColumn(i);
            if (h) {
                var target = cols[i].width - diff;
                if (h.offsetWidth !== target) {
                    h.style.width = target + 'px'
                }
            }
        }

        this.updateViewColLeftRight();
    }

    setSortColumn(columnId: string, ascending: boolean) {
        this.setSortColumns([{ columnId: columnId, sortAsc: ascending }]);
    }

    setSortColumns(cols: ColumnSort[]) {
        this._sortColumns = cols || [];

        var headerColumnEls: Element[] = [];
        this._layout.getHeaderCols().forEach(el => headerColumnEls = headerColumnEls.concat(Array.from(el.children)));
        headerColumnEls.forEach(hel => {
            hel.classList.remove("slick-header-column-sorted");
            var si = hel.querySelector(".slick-sort-indicator");
            si && si.classList.remove("slick-sort-indicator-asc", "slick-sort-indicator-desc");
        });

        this._sortColumns.forEach(col => {
            if (col.sortAsc == null) {
                col.sortAsc = true;
            }
            var columnIndex = this.getColumnIndex(col.columnId);
            if (columnIndex != null) {
                var header = headerColumnEls[columnIndex];
                if (header) {
                    header.classList.add("slick-header-column-sorted");
                    var si = header.querySelector(".slick-sort-indicator");
                    si && si.classList.add(col.sortAsc ? "slick-sort-indicator-asc" : "slick-sort-indicator-desc");
                }
            }
        });
    }

    getSortColumns(): ColumnSort[] {
        return this._sortColumns;
    }

    private handleSelectedRangesChanged = (e: IEventData, ranges: Range[]): void => {
        var previousSelectedRows = this._selectedRows.slice(0); // shallow copy previously selected rows for later comparison
        this._selectedRows = [];
        var hash = {}, cols = this._cols;
        for (var i = 0; i < ranges.length; i++) {
            for (var j = ranges[i].fromRow; j <= ranges[i].toRow; j++) {
                if (!hash[j]) {  // prevent duplicates
                    this._selectedRows.push(j);
                    hash[j] = {};
                }
                for (var k = ranges[i].fromCell; k <= ranges[i].toCell; k++) {
                    if (this.canCellBeSelected(j, k)) {
                        hash[j][cols[k].id] = this._options.selectedCellCssClass;
                    }
                }
            }
        }

        this.setCellCssStyles(this._options.selectedCellCssClass, hash);

        if (!simpleArrayEquals(previousSelectedRows, this._selectedRows)) {
            var caller = e && (e as any).detail && (e as any).detail.caller || 'click';
            var newSelectedAdditions = this._selectedRows.filter(i => previousSelectedRows.indexOf(i) < 0);
            var newSelectedDeletions = previousSelectedRows.filter(i => this._selectedRows.indexOf(i) < 0);

            this.trigger(this.onSelectedRowsChanged, {
                rows: this.getSelectedRows(),
                previousSelectedRows: previousSelectedRows,
                caller: caller,
                changedSelectedRows: newSelectedAdditions,
                changedUnselectedRows: newSelectedDeletions
            }, e);
        }

        this._selectedRows = [];
        var hash = {}, cols = this._cols;
        for (var i = 0; i < ranges.length; i++) {
            for (var j = ranges[i].fromRow; j <= ranges[i].toRow; j++) {
                if (!hash[j]) {  // prevent duplicates
                    this._selectedRows.push(j);
                    hash[j] = {};
                }
                for (var k = ranges[i].fromCell; k <= ranges[i].toCell; k++) {
                    if (this.canCellBeSelected(j, k)) {
                        hash[j][cols[k].id] = this._options.selectedCellCssClass;
                    }
                }
            }
        }
    }

    getColumns(): Column<TItem>[] {
        return this._cols;
    }

    getInitialColumns(): Column<TItem>[] {
        return this._initCols;
    }

    private updateViewColLeftRight(): void {
        this._colLeft = [];
        this._colRight = [];
        var x = 0, r: number, cols = this._cols, i: number, l: number = cols.length, frozenCols = this._frozenCols;
        for (var i = 0; i < l; i++) {
            if (frozenCols === i)
                x = 0;
            r = x + cols[i].width;
            this._colLeft[i] = x;
            this._colRight[i] = r;
            x = r;
        }
    }

    private setInitialCols(initCols: Column[]) {

        var defs = this._colDefaults;
        var initColById = {};
        var frozenColumns: Column[] = [];
        var viewCols: Column[] = [];
        var viewColById: { [key: string]: number } = {};
        var i: number, m: Column, k: string;
        for (i = 0; i < initCols.length; i++) {
            m = initCols[i];

            for (k in defs) {
                if (m[k] === undefined)
                    m[k] = this._colDefaults[k];
            }

            if (m.minWidth && m.width < m.minWidth) {
                m.width = m.minWidth;
            }

            if (m.maxWidth && m.width > m.maxWidth) {
                m.width = m.maxWidth;
            }

            initColById[m.id] = i;

            if (m.visible !== false) {
                (m.frozen ? frozenColumns : viewCols).push(m);
            }
        }

        this._frozenCols = frozenColumns.length;
        if (frozenColumns.length > 0)
            viewCols = frozenColumns.concat(viewCols);

        for (i = 0; i < viewCols.length; i++) {
            m = viewCols[i];
            viewColById[m.id] = i;
        }

        this._initCols = initCols;
        this._initColById = initColById;
        this._cols = viewCols;
        this._colById = viewColById;
    }

    setColumns(columns: Column<TItem>[]): void {
        this.setInitialCols(columns);
        this.updateViewColLeftRight();

        if (this._initialized) {
            this._layout.setPaneVisibility();
            this.setOverflow();

            this.invalidateAllRows();
            this.createColumnHeaders();
            this.createColumnFooters();
            this.updateFooterTotals();
            this.removeCssRules();
            this.createCssRules();
            this.resizeCanvas();
            this.updateCanvasWidth();
            this._layout.applyColumnWidths();
            this.handleScroll();
            this.getSelectionModel()?.refreshSelections();
        }
    }

    getOptions(): GridOptions<TItem> {
        return this._options;
    }

    setOptions(args: GridOptions<TItem>, suppressRender?: boolean, suppressColumnSet?: boolean, suppressSetOverflow?: boolean): void {
        if (!this.getEditorLock().commitCurrentEdit()) {
            return;
        }

        this.makeActiveCellNormal();

        if (args.showColumnHeader !== undefined) {
            this.setColumnHeaderVisibility(args.showColumnHeader);
        }

        if (this._options.enableAddRow !== args.enableAddRow) {
            this.invalidateRow(this.getDataLength());
        }

        this._options = $.extend(this._options, args);
        this.validateAndEnforceOptions();
        this.adjustFrozenRowOption();

        this.getViewports().forEach(vp => vp.style.overflowY = this._options.autoHeight ? "hidden" : "auto");

        if (!suppressSetOverflow) {
            this.setOverflow();
        }

        if (args.columns && !suppressColumnSet) {
            adjustFrozenColumnCompat(args.columns, this._options);
            this.setColumns(args.columns ?? this._initCols);
        }
        else if (args.frozenColumns != null) {
            adjustFrozenColumnCompat(this._initCols, this._options);
            this.setColumns(this._initCols);
        }

        this._layout.setScroller();
        if (!suppressRender)
            this.render();
    }

    private validateAndEnforceOptions(): void {
        if (this._options.autoHeight) {
            this._options.leaveSpaceForNewRows = false;
        }
    }

    private viewOnRowCountChanged = () => {
        this.updateRowCount();
        this.render();
    }

    private viewOnRowsChanged = (_: any, args: { rows: number[] }): void => {
        this.invalidateRows(args.rows);
        this.render();
        this.updateFooterTotals();
    }

    private viewOnDataChanged = (): void => {
        this.invalidate();
        this.render();
    }

    private bindToData(): void {
        if (this._data) {
            this._data.onRowCountChanged && this._data.onRowCountChanged.subscribe(this.viewOnRowCountChanged);
            this._data.onRowsChanged && this._data.onRowsChanged.subscribe(this.viewOnRowsChanged);
            this._data.onDataChanged && this._data.onDataChanged.subscribe(this.viewOnDataChanged);
        }
    }

    private unbindFromData(): void {
        if (this._data) {
            this._data.onRowCountChanged && this._data.onRowCountChanged.unsubscribe(this.viewOnRowCountChanged);
            this._data.onRowsChanged && this._data.onRowsChanged.unsubscribe(this.viewOnRowsChanged);
            this._data.onDataChanged && this._data.onDataChanged.unsubscribe(this.viewOnDataChanged);
        }
    }

    setData(newData: any, scrollToTop?: boolean) {
        this.unbindFromData();
        this._data = newData;
        this.bindToData();
        this.invalidateAllRows();
        this.updateRowCount();
        if (scrollToTop) {
            this.scrollTo(0);
        }
    }

    getData(): any {
        return this._data;
    }

    getDataLength(): number {
        if (this._data.getLength) {
            return this._data.getLength();
        } else {
            return this._data.length;
        }
    }

    private getDataLengthIncludingAddNew(): number {
        return this.getDataLength() + (!this._options.enableAddRow ? 0 :
            (!this._pagingActive || this._pagingIsLastPage ? 1 : 0));
    }

    getDataItem(i: number): TItem {
        if (this._data.getItem) {
            return this._data.getItem(i);
        } else {
            return this._data[i];
        }
    }

    getTopPanel(): HTMLDivElement {
        return this._layout.getTopPanelFor(0);
    }

    setTopPanelVisibility(visible: boolean): void {
        if (this._options.showTopPanel != visible) {
            this._options.showTopPanel = !!visible;

            this._layout.getTopPanelNodes().forEach(el => {
                if (this._hasJQuery)
                    $(el)[visible ? "slideDown" : "slideUp"]("fast", this.resizeCanvas);
                else {
                    el.style.display = visible ? '' : 'none';
                    this.resizeCanvas();
                }
            });
        }
    }

    setColumnHeaderVisibility(visible: boolean, animate?: boolean) {
        if (this._options.showColumnHeader != visible) {
            this._options.showColumnHeader = visible;
            this._layout.getHeaderCols().forEach(n => {
                const el = n.parentElement;
                if (animate && this._hasJQuery)
                    $(el)[visible ? "slideDown" : "slideUp"]("fast", this.resizeCanvas);
                else {
                    el.style.display = visible ? '' : 'none';
                    this.resizeCanvas();
                }
            });
        }
    }

    setFooterRowVisibility(visible: boolean): void {
        if (this._options.showFooterRow != visible) {
            this._options.showFooterRow = !!visible;
            this._layout.getFooterRowCols().forEach(n => {
                const el = n.parentElement;
                if (this._hasJQuery)
                    $(el)[visible ? "slideDown" : "slideUp"]("fast", this.resizeCanvas);
                else {
                    el.style.display = visible ? '' : 'none';
                    this.resizeCanvas();
                }
            });
        }
    }

    setGroupingPanelVisibility(visible: boolean): void {
        if (this._options.showGroupingPanel != visible) {
            this._options.showGroupingPanel = visible;
            if (!this._options.groupingPanel)
                return;

            const el = this._groupingPanel;
            if (this._hasJQuery)
                $(el)[visible ? "slideDown" : "slideUp"]("fast", this.resizeCanvas);
            else {
                el.style.display = visible ? '' : 'none';
                this.resizeCanvas();
            }
        }
    }

    setPreHeaderPanelVisibility(visible: boolean): void {
        this.setGroupingPanelVisibility(visible);
    }

    setHeaderRowVisibility(visible: boolean): void {
        if (this._options.showHeaderRow != visible) {
            this._options.showHeaderRow = visible;
            this._layout.getHeaderRowCols().forEach(n => {
                const el = n.parentElement;
                if (this._hasJQuery)
                    $(el)[visible ? "slideDown" : "slideUp"]("fast", this.resizeCanvas);
                else {
                    el.style.display = visible ? '' : 'none';
                    this.resizeCanvas();
                }
            });
        }
    }

    getContainerNode(): HTMLElement {
        return this._container;
    }

    getUID(): string {
        return this._uid;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Rendering / Scrolling

    private getRowTop(row: number): number {
        return this._options.rowHeight * row - this._pageOffset;
    }

    private getRowFromPosition(y: number): number {
        return Math.floor((y + this._pageOffset) / this._options.rowHeight);
    }

    private scrollTo(y: number): void {
        y = Math.max(y, 0);
        y = Math.min(y, this._virtualHeight - Math.round($(this._scrollContainerY).height()) + ((this._viewportHasHScroll || this.hasFrozenColumns()) ? this._scrollDims.height : 0));

        var oldOffset = this._pageOffset;

        this._page = Math.min(this._numberOfPages - 1, Math.floor(y / this._pageHeight));
        this._pageOffset = Math.round(this._page * this._jumpinessCoefficient);
        var newScrollTop = y - this._pageOffset;

        if (this._pageOffset != oldOffset) {
            var range = this.getVisibleRange(newScrollTop);
            this.cleanupRows(range);
            this.updateRowPositions();
        }

        if (this._scrollTopPrev != newScrollTop) {
            this._vScrollDir = (this._scrollTopPrev + oldOffset < newScrollTop + this._pageOffset) ? 1 : -1;

            this._scrollTopRendered = (this._scrollTop = this._scrollTopPrev = newScrollTop);

            this._layout.handleScrollV();
            this._scrollContainerY.scrollTop = newScrollTop;

            this.trigger(this.onViewportChanged);
        }
    }

    getFormatter(row: number, column: Column<TItem>): ColumnFormatter<TItem> {
        var data = this._data;
        var itemMetadata = data.getItemMetadata && data.getItemMetadata(row) as ItemMetadata;
        var colsMetadata = itemMetadata && itemMetadata.columns;
        var columnMetadata = colsMetadata && (colsMetadata[column.id] || colsMetadata[this.getColumnIndex(column.id)]);

        return (columnMetadata && columnMetadata.formatter) ||
            (itemMetadata && itemMetadata.formatter) ||
            column.formatter ||
            (this._options.formatterFactory && this._options.formatterFactory.getFormatter(column)) ||
            this._options.defaultFormatter;
    }

    private getEditor(row: number, cell: number): Editor {
        var column = this._cols[cell];
        var itemMetadata = this._data.getItemMetadata && this._data.getItemMetadata(row);
        var colsMetadata = itemMetadata && itemMetadata.columns;

        if (colsMetadata && colsMetadata[column.id] && colsMetadata[column.id].editor !== undefined) {
            return colsMetadata[column.id].editor;
        }
        if (colsMetadata && colsMetadata[cell] && colsMetadata[cell].editor !== undefined) {
            return colsMetadata[cell].editor;
        }

        return column.editor || (this._options.editorFactory && this._options.editorFactory.getEditor(column));
    }

    private getDataItemValueForColumn(item: TItem, columnDef: Column<TItem>): any {
        if (this._options.dataItemColumnValueExtractor) {
            return this._options.dataItemColumnValueExtractor(item, columnDef);
        }
        return item[columnDef.field];
    }

    private appendRowHtml(stringArrayL: string[], stringArrayR: string[], row: number, range: ViewRange, dataLength: number): void {
        var d = this.getDataItem(row);
        var dataLoading = row < dataLength && !d;
        var rowCss = "slick-row" +
            (this.hasFrozenRows() && row < this._frozenRows ? ' frozen' : '') +
            (dataLoading ? " loading" : "") +
            (row === this._activeRow ? " active" : "") +
            (row % 2 == 1 ? " odd" : " even");

        if (!d) {
            rowCss += " " + this._options.addNewRowCssClass;
        }

        var itemMetadata = this._data.getItemMetadata && this._data.getItemMetadata(row);

        if (itemMetadata && itemMetadata.cssClasses) {
            rowCss += " " + itemMetadata.cssClasses;
        }

        var frozenRowOffset = this.getFrozenRowOffset(row);

        var rowHtml = "<div class='" + (this._options.useLegacyUI ? "ui-widget-content " : "") + rowCss + "' style='top:"
            + (this.getRowTop(row) - frozenRowOffset)
            + "px'>";

        stringArrayL.push(rowHtml);

        if (this.hasFrozenColumns()) {
            stringArrayR.push(rowHtml);
        }

        var colspan, m, cols = this._cols, frozenCols = this._frozenCols;
        for (var i = 0, ii = cols.length; i < ii; i++) {
            var columnData = null;
            m = cols[i];
            colspan = 1;
            if (itemMetadata && itemMetadata.columns) {
                columnData = itemMetadata.columns[m.id] || itemMetadata.columns[i];
                colspan = (columnData && columnData.colspan) || 1;
                if (colspan === "*") {
                    colspan = ii - i;
                }
            }

            // Do not render cells outside of the viewport.
            if (this._colRight[Math.min(ii - 1, i + colspan - 1)] > range.leftPx) {
                if (this._colLeft[i] > range.rightPx) {
                    // All columns to the right are outside the range.
                    break;
                }

                this.appendCellHtml(frozenCols > 0 && i >= frozenCols ? stringArrayR : stringArrayL, row, i, colspan, d, columnData);
            }

            if (colspan > 1) {
                i += (colspan - 1);
            }
        }

        stringArrayL.push("</div>");

        if (this.hasFrozenColumns()) {
            stringArrayR.push("</div>");
        }
    }

    private appendCellHtml(sb: string[], row: number, cell: number, colspan: number, item: TItem, metadata: any): void {
        var cols = this._cols, frozenCols = this._frozenCols, m = cols[cell];
        var klass = "slick-cell l" + cell + " r" + Math.min(cols.length - 1, cell + colspan - 1) +
            (m.cssClass ? " " + m.cssClass : "");

        if (cell < frozenCols)
            klass += ' frozen';

        if (row === this._activeRow && cell === this._activeCell)
            klass += " active";

        if (metadata && metadata.cssClasses) {
            klass += " " + metadata.cssClasses;
        }

        for (var key in this._cellCssClasses) {
            if (this._cellCssClasses[key][row] && this._cellCssClasses[key][row][m.id]) {
                klass += (" " + this._cellCssClasses[key][row][m.id]);
            }
        }

        // if there is a corresponding row (if not, this is the Add New row or this data hasn't been loaded yet)
        var fmtResult: FormatterResult | string;
        if (item) {
            var value = this.getDataItemValueForColumn(item, m);
            fmtResult = this.getFormatter(row, m)(row, cell, value, m, item, this);
        }

        if (fmtResult == null)
            sb.push('<div class="' + attrEncode(klass) + '"></div>');
        else if (typeof fmtResult === "string" ||
            Object.prototype.toString.call(fmtResult) !== '[object Object]')
            sb.push('<div class="' + attrEncode(klass) + '">' + fmtResult + '</div>');
        else {
            if (fmtResult.addClass?.length)
                klass += (" " + fmtResult.addClass);

            sb.push('<div class="' + attrEncode(klass) + '"');

            if (fmtResult.addClass?.length)
                sb.push(' data-fmtcls="' + attrEncode(fmtResult.addClass) + '"');

            var attrs = fmtResult.addAttrs;
            if (attrs != null) {
                var ks = [];
                for (var k in attrs) {
                    sb.push(k + '="' + attrEncode(attrs[k]) + '"');
                    ks.push(k);
                }
                sb.push(' data-fmtatt="' + attrEncode(ks.join(',')) + '"');
            }

            var toolTip = fmtResult.toolTip;
            if (toolTip != null && toolTip.length)
                sb.push('tooltip="' + attrEncode(toolTip) + '"');

            if (fmtResult.html != null)
                sb.push('>' + fmtResult.html + '</div>');
            else if (fmtResult.text != null)
                sb.push('>' + htmlEncode(fmtResult.text) + '</div>');
            else
                sb.push('></div>');
        }

        this._rowsCache[row].cellRenderQueue.push(cell);
        this._rowsCache[row].cellColSpans[cell] = colspan;
    }

    private cleanupRows(rangeToKeep: ViewRange): void {
        var i: number;
        for (var x in this._rowsCache) {
            var removeFrozenRow = true;
            i = parseInt(x, 10);
            if (this.hasFrozenRows()
                && ((this._options.frozenBottom && i >= this._actualFrozenRow) // Frozen bottom rows
                    || (!this._options.frozenBottom && i <= this._actualFrozenRow) // Frozen top rows
                )
            ) {
                removeFrozenRow = false;
            }

            if (i !== this._activeRow
                && (i < rangeToKeep.top || i > rangeToKeep.bottom)
                && (removeFrozenRow)) {
                this.removeRowFromCache(i);
            }
        }

        this._options.enableAsyncPostRenderCleanup && this.startPostProcessingCleanup();
    }

    invalidate(): void {
        this.updateRowCount();
        this.invalidateAllRows();
        this.render();
        this.updateFooterTotals();
    }

    invalidateAllRows(): void {
        if (this._currentEditor) {
            this.makeActiveCellNormal();
        }
        for (var row in this._rowsCache) {
            this.removeRowFromCache(parseInt(row, 10));
        }

        this._options.enableAsyncPostRenderCleanup && this.startPostProcessingCleanup();
    }

    private queuePostProcessedRowForCleanup(cacheEntry: CachedRow, postProcessedRow: { [key: number]: any }, rowIdx: number): void {
        this._postProcessGroupId++;

        // store and detach node for later async cleanup
        for (var x in postProcessedRow) {
            if (postProcessedRow.hasOwnProperty(x)) {
                var columnIdx = parseInt(x, 10);
                this._postProcessCleanupQueue.push({
                    groupId: this._postProcessGroupId,
                    cellNode: cacheEntry.cellNodesByColumnIdx[columnIdx | 0],
                    columnIdx: columnIdx | 0,
                    rowIdx: rowIdx
                });
            }
        }

        this._postProcessCleanupQueue.push({
            groupId: this._postProcessGroupId,
            rowNodeL: cacheEntry.rowNodeL,
            rowNodeR: cacheEntry.rowNodeR
        });

        cacheEntry.rowNodeL?.remove();
        cacheEntry.rowNodeR?.remove();
    }

    private queuePostProcessedCellForCleanup(cellnode: HTMLElement, columnIdx: number, rowIdx: number): void {
        this._postProcessCleanupQueue.push({
            groupId: this._postProcessGroupId,
            cellNode: cellnode,
            columnIdx: columnIdx,
            rowIdx: rowIdx
        });
        $(cellnode).detach();
    }

    private removeRowFromCache(row: number): void {
        var cacheEntry = this._rowsCache[row];
        if (!cacheEntry) {
            return;
        }

        if (this._options.enableAsyncPostRenderCleanup && this._postProcessedRows[row]) {
            this.queuePostProcessedRowForCleanup(cacheEntry, this._postProcessedRows[row], row);
        }
        else {
            cacheEntry.rowNodeL?.parentElement?.removeChild(cacheEntry.rowNodeL);
            cacheEntry.rowNodeR?.parentElement?.removeChild(cacheEntry.rowNodeR);
        }

        delete this._rowsCache[row];
        delete this._postProcessedRows[row];
    }

    invalidateRows(rows: number[]): void {
        var i, rl;
        if (!rows || !rows.length) {
            return;
        }
        this._vScrollDir = 0;
        for (i = 0, rl = rows.length; i < rl; i++) {
            if (this._currentEditor && this._activeRow === rows[i]) {
                this.makeActiveCellNormal();
            }
            if (this._rowsCache[rows[i]]) {
                this.removeRowFromCache(rows[i]);
            }
        }

        this._options.enableAsyncPostRenderCleanup && this.startPostProcessingCleanup();
    }

    invalidateRow(row: number): void {
        this.invalidateRows([row]);
    }

    applyFormatResultToCellNode(fmtResult: FormatterResult | string, cellNode: HTMLElement) {
        var oldFmtCls = cellNode.dataset?.fmtcls as string;
        if (oldFmtCls != null && oldFmtCls.length > 0) {
            cellNode.classList.remove(...oldFmtCls.split(' '));
            delete cellNode.dataset.fmtcls;
        }

        var oldFmtAtt = cellNode.dataset?.fmtatt as string;
        if (oldFmtAtt != null && oldFmtAtt.length > 0) {
            for (var k of oldFmtAtt.split(','))
                cellNode.removeAttribute(k);
            delete cellNode.dataset.fmtatt;
        }

        cellNode.removeAttribute('tooltip');

        if (fmtResult == null) {
            cellNode.innerHTML = '';
            return;
        }

        if (typeof fmtResult === "string" || Object.prototype.toString.call(fmtResult) !== '[object Object]') {
            cellNode.innerHTML = "" + fmtResult;
            return;
        }

        if (fmtResult.html != null)
            cellNode.innerHTML = fmtResult.html;
        else
            cellNode.textContent = fmtResult.text ?? '';

        if (fmtResult.addClass?.length) {
            cellNode.classList.add(...fmtResult.addClass.split(' '));
            cellNode.dataset.fmtcls = fmtResult.addClass;
        }

        if (fmtResult.addAttrs != null) {
            var keys = Object.keys(fmtResult.addAttrs);
            if (keys.length) {
                for (var k of keys) {
                    cellNode.setAttribute(k, fmtResult.addAttrs[k]);
                }
                cellNode.dataset.fmtatt = keys.join(',');
            }
        }

        if (fmtResult.toolTip !== undefined)
            cellNode.setAttribute('tooltip', fmtResult.toolTip ?? '');
    }

    updateCell(row: number, cell: number): void {
        var cellNode = this.getCellNode(row, cell);
        if (!cellNode) {
            return;
        }

        var m = this._cols[cell], d = this.getDataItem(row);
        if (this._currentEditor && this._activeRow === row && this._activeCell === cell) {
            this._currentEditor.loadValue(d);
        } else {
            var fmtResult = d ? this.getFormatter(row, m)(row, cell, this.getDataItemValueForColumn(d, m), m, d) : "";
            this.applyFormatResultToCellNode(fmtResult, cellNode);
            this.invalidatePostProcessingResults(row);
        }
    }

    updateRow(row: number): void {
        var cacheEntry = this._rowsCache[row];
        if (!cacheEntry) {
            return;
        }

        this.ensureCellNodesInRowsCache(row);

        var d = this.getDataItem(row);
        var fmtResult: FormatterResult | string;

        for (var x in cacheEntry.cellNodesByColumnIdx) {
            if (!cacheEntry.cellNodesByColumnIdx.hasOwnProperty(x)) {
                continue;
            }

            var columnIdx = parseInt(x, 10);
            var m = this._cols[columnIdx],
                node = cacheEntry.cellNodesByColumnIdx[columnIdx];

            if (row === this._activeRow && columnIdx === this._activeCell && this._currentEditor) {
                this._currentEditor.loadValue(d);
            }
            else {
                fmtResult = d ? this.getFormatter(row, m)(row, columnIdx, this.getDataItemValueForColumn(d, m), m, d) : '';
                this.applyFormatResultToCellNode(fmtResult, node);
            }
        }

        this.invalidatePostProcessingResults(row);
    }

    private getViewportHeight(): number {
        const layout = this._layout;
        this._groupingPanelH = (this._options.groupingPanel && this._options.showGroupingPanel) ? (this._options.groupingPanelHeight + this.getVBoxDelta(this._groupingPanel)) : 0
        this._topPanelH = this._options.showTopPanel ? (this._options.topPanelHeight + this.getVBoxDelta(layout.getTopPanelFor(0).parentElement)) : 0;
        this._headerRowH = this._options.showHeaderRow ? (this._options.headerRowHeight + this.getVBoxDelta(layout.getHeaderRowColsFor(0).parentElement)) : 0;
        this._footerRowH = this._options.showFooterRow ? (this._options.footerRowHeight + this.getVBoxDelta(layout.getFooterRowColsFor(0).parentElement)) : 0;

        var headerH = (this._options.showColumnHeader) ? (parseFloat(getComputedStyle(layout.getHeaderColsFor(0).parentElement).height) + this.getVBoxDelta(layout.getHeaderColsFor(0).parentElement)) : 0;

        if (this._options.autoHeight) {
            this._viewportH = this._options.rowHeight * this.getDataLengthIncludingAddNew();
            if (this.getCanvasWidth() > this._viewportW)
                this._viewportH += this._scrollDims.height;
        } else {

            var style = getComputedStyle(this._container);
            this._viewportH = parseFloat(style.height)
                - parseFloat(style.paddingTop)
                - parseFloat(style.paddingBottom)
                - headerH
                - this._topPanelH
                - this._headerRowH
                - this._footerRowH
                - this._groupingPanelH;
        }

        this._numVisibleRows = Math.ceil(this._viewportH / this._options.rowHeight);
        return this._viewportH;
    }

    private getViewportWidth(): void {
        this._viewportW = parseFloat(getComputedStyle(this._container).width);
    }

    resizeCanvas = (): void => {
        if (!this._initialized) {
            return;
        }

        this.getViewportWidth();
        this.getViewportHeight();

        this._layout.resizeCanvas();

        if (!this._scrollDims || !this._scrollDims.width) {
            this._scrollDims = getScrollBarDimensions(true);
        }

        if (this._options.forceFitColumns) {
            this.autosizeColumns();
        }

        this.updateRowCount();
        this.handleScroll();
        // Since the width has changed, force the render() to reevaluate virtually rendered cells.
        this._scrollLeftRendered = -1;
        this.render();
    }

    updatePagingStatusFromView(pagingInfo: { pageSize: number, pageNum: number, totalPages: number }) {
        this._pagingActive = (pagingInfo.pageSize !== 0);
        this._pagingIsLastPage = (pagingInfo.pageNum == pagingInfo.totalPages - 1);
    }

    private updateRowCount(): void {
        if (!this._initialized) {
            return;
        }

        var dataLengthIncludingAddNew = this.getDataLengthIncludingAddNew();
        var oldH = (this.hasFrozenRows() && !this._options.frozenBottom) ? Math.round(parseFloat(getComputedStyle(this._canvasBottomL).height)) : Math.round(parseFloat(getComputedStyle(this._canvasTopL).height));

        var numberOfRows;
        if (this.hasFrozenRows()) {
            numberOfRows = this.getDataLength() - this._frozenRows;
        } else {
            numberOfRows = dataLengthIncludingAddNew + (this._options.leaveSpaceForNewRows ? this._numVisibleRows - 1 : 0);
        }

        var tempViewportH = Math.round(parseFloat(getComputedStyle(this._scrollContainerY).height));
        var oldViewportHasVScroll = this._viewportHasVScroll;
        // with autoHeight, we do not need to accommodate the vertical scroll bar
        this._viewportHasVScroll = !this._options.autoHeight && (numberOfRows * this._options.rowHeight > tempViewportH);

        this.makeActiveCellNormal();

        // remove the rows that are now outside of the data range
        // this helps avoid redundant calls to .removeRow() when the size of the data decreased by thousands of rows
        var l = dataLengthIncludingAddNew - 1;
        for (var x in this._rowsCache) {
            var i = parseInt(x, 10);
            if (i >= l) {
                this.removeRowFromCache(i);
            }
        }

        this._options.enableAsyncPostRenderCleanup && this.startPostProcessingCleanup();

        this._virtualHeight = Math.max(this._options.rowHeight * numberOfRows, tempViewportH - this._scrollDims.height);

        if (this._activeCellNode && this._activeRow > l) {
            this.resetActiveCell();
        }

        if (this._virtualHeight < getMaxSupportedCssHeight()) {
            // just one page
            this._realScrollHeight = this._pageHeight = this._virtualHeight;
            this._numberOfPages = 1;
            this._jumpinessCoefficient = 0;
        } else {
            // break into pages
            this._realScrollHeight = getMaxSupportedCssHeight();
            this._pageHeight = this._realScrollHeight / 100;
            this._numberOfPages = Math.floor(this._virtualHeight / this._pageHeight);
            this._jumpinessCoefficient = (this._virtualHeight - this._realScrollHeight) / (this._numberOfPages - 1);
        }

        if (this._realScrollHeight !== oldH) {
            if (this.hasFrozenRows() && !this._options.frozenBottom) {
                this._canvasBottomL.style.height = this._realScrollHeight + 'px';

                if (this.hasFrozenColumns()) {
                    this._canvasBottomR.style.height = this._realScrollHeight + 'px';
                }
            } else {
                this._canvasTopL.style.height = this._realScrollHeight + 'px'
                this._canvasTopR.style.height = this._realScrollHeight + 'px'
            }

            this._scrollTop = this._scrollContainerY.scrollTop;
        }

        var oldScrollTopInRange = (this._scrollTop + this._pageOffset <= this._virtualHeight - tempViewportH);

        if (this._virtualHeight == 0 || this._scrollTop == 0) {
            this._page = this._pageOffset = 0;
        } else if (oldScrollTopInRange) {
            // maintain virtual position
            this.scrollTo(this._scrollTop + this._pageOffset);
        } else {
            // scroll to bottom
            this.scrollTo(this._virtualHeight - tempViewportH);
        }

        if (this._realScrollHeight != oldH && this._options.autoHeight) {
            this.resizeCanvas();
        }

        if (this._options.forceFitColumns && oldViewportHasVScroll != this._viewportHasVScroll) {
            this.autosizeColumns();
        }
        this.updateCanvasWidth(false);
    }

    /**
     * @param viewportTop optional viewport top
     * @param viewportLeft optional viewport left
     * @returns viewport range
     */
    getViewport(viewportTop?: number, viewportLeft?: number): ViewRange {
        return this.getVisibleRange(viewportTop, viewportLeft);
    }

    getVisibleRange(viewportTop?: number, viewportLeft?: number): ViewRange {
        if (viewportTop == null) {
            viewportTop = this._scrollTop;
        }
        if (viewportLeft == null) {
            viewportLeft = this._scrollLeft;
        }

        return {
            top: this.getRowFromPosition(viewportTop),
            bottom: this.getRowFromPosition(viewportTop + this._viewportH) + 1,
            leftPx: viewportLeft,
            rightPx: viewportLeft + this._viewportW
        };
    }

    getRenderedRange(viewportTop?: number, viewportLeft?: number): ViewRange {
        var range = this.getVisibleRange(viewportTop, viewportLeft);
        var buffer = Math.round(this._viewportH / this._options.rowHeight);
        var minBuffer = this._options.minBuffer || 3;

        if (this._vScrollDir == -1) {
            range.top -= buffer;
            range.bottom += minBuffer;
        } else if (this._vScrollDir == 1) {
            range.top -= minBuffer;
            range.bottom += buffer;
        } else {
            range.top -= minBuffer;
            range.bottom += minBuffer;
        }

        range.top = Math.max(0, range.top);
        range.bottom = Math.min(this.getDataLengthIncludingAddNew() - 1, range.bottom);

        if (this._options.renderAllCells) {
            range.leftPx = 0;
            range.rightPx = this._canvasWidth;
        }
        else {
            range.leftPx -= this._viewportW;
            range.rightPx += this._viewportW;

            range.leftPx = Math.max(0, range.leftPx);
            range.rightPx = Math.min(this._canvasWidth, range.rightPx);
        }

        return range;
    }

    private ensureCellNodesInRowsCache(row: number): void {
        var cacheEntry = this._rowsCache[row];
        if (cacheEntry) {
            if (cacheEntry.cellRenderQueue.length) {
                var lastChild = cacheEntry.rowNodeR?.lastElementChild ?? cacheEntry.rowNodeL?.lastElementChild;
                while (lastChild && cacheEntry.cellRenderQueue.length) {
                    var columnIdx = cacheEntry.cellRenderQueue.pop();

                    cacheEntry.cellNodesByColumnIdx[columnIdx] = lastChild as HTMLElement;
                    lastChild = lastChild.previousElementSibling;

                    if (lastChild == null)
                        lastChild = cacheEntry.rowNodeL?.lastElementChild;
                }
            }
        }
    }

    private cleanUpCells(range: ViewRange, row: number): void {
        // Ignore frozen rows
        if (this.hasFrozenRows()
            && ((this._options.frozenBottom && row > this._actualFrozenRow) // Frozen bottom rows
                || (row <= this._actualFrozenRow)  // Frozen top rows
            )
        ) {
            return;
        }

        var totalCellsRemoved = 0;
        var cacheEntry = this._rowsCache[row];

        // Remove cells outside the range.
        var cellsToRemove = [], frozenCols = this._frozenCols;
        for (var x in cacheEntry.cellNodesByColumnIdx) {
            // I really hate it when people mess with Array.prototype.
            if (!cacheEntry.cellNodesByColumnIdx.hasOwnProperty(x)) {
                continue;
            }

            var i = parseInt(x, 10);

            // Ignore frozen columns
            if (i < frozenCols) {
                continue;
            }

            var colspan = cacheEntry.cellColSpans[i], cols = this._cols;
            if (this._colLeft[i] > range.rightPx || this._colRight[Math.min(cols.length - 1, i + colspan - 1)] < range.leftPx) {
                if (!(row == this._activeRow && i === this._activeCell)) {
                    cellsToRemove.push(i);
                }
            }
        }

        var cellToRemove, node;
        this._postProcessGroupId++;
        while ((cellToRemove = cellsToRemove.pop()) != null) {
            node = cacheEntry.cellNodesByColumnIdx[cellToRemove];

            if (this._options.enableAsyncPostRenderCleanup && this._postProcessedRows[row] && this._postProcessedRows[row][cellToRemove]) {
                this.queuePostProcessedCellForCleanup(node, cellToRemove, row);
            } else {
                node.parentElement.removeChild(node);
            }

            delete cacheEntry.cellColSpans[cellToRemove];
            delete cacheEntry.cellNodesByColumnIdx[cellToRemove];
            if (this._postProcessedRows[row]) {
                delete this._postProcessedRows[row][cellToRemove];
            }
            totalCellsRemoved++;
        }
    }

    private cleanUpAndRenderCells(range: ViewRange) {
        var cacheEntry;
        var stringArray: string[] = [];
        var processedRows = [];
        var cellsAdded;
        var totalCellsAdded = 0;
        var colspan;
        var cols = this._cols;

        for (var row = range.top, btm = range.bottom; row <= btm; row++) {
            cacheEntry = this._rowsCache[row];
            if (!cacheEntry) {
                continue;
            }

            // cellRenderQueue populated in renderRows() needs to be cleared first
            this.ensureCellNodesInRowsCache(row);

            this.cleanUpCells(range, row);

            // Render missing cells.
            cellsAdded = 0;

            var itemMetadata = this._data.getItemMetadata && this._data.getItemMetadata(row) as ItemMetadata;
            var colsMetadata = itemMetadata && itemMetadata.columns;

            var d = this.getDataItem(row);

            // TODO:  shorten this loop (index? heuristics? binary search?)
            for (var i = 0, ii = cols.length; i < ii; i++) {
                // Cells to the right are outside the range.
                if (this._colLeft[i] > range.rightPx) {
                    break;
                }

                // Already rendered.
                if ((colspan = cacheEntry.cellColSpans[i]) != null) {
                    i += (colspan > 1 ? colspan - 1 : 0);
                    continue;
                }

                var columnData = null;
                colspan = 1;
                if (colsMetadata) {
                    columnData = colsMetadata[cols[i].id] || colsMetadata[i];
                    colspan = (columnData && columnData.colspan) || 1;
                    if (colspan === "*") {
                        colspan = ii - i;
                    }
                }

                if (this._colRight[Math.min(ii - 1, i + colspan - 1)] > range.leftPx) {
                    this.appendCellHtml(stringArray, row, i, colspan, d, columnData);
                    cellsAdded++;
                }

                i += (colspan > 1 ? colspan - 1 : 0);
            }

            if (cellsAdded) {
                totalCellsAdded += cellsAdded;
                processedRows.push(row);
            }
        }

        if (!stringArray.length) {
            return;
        }

        var x = document.createElement("div");
        x.innerHTML = stringArray.join("");

        var processedRow;
        var node: HTMLElement, frozenCols = this._frozenCols;
        while ((processedRow = processedRows.pop()) != null) {
            cacheEntry = this._rowsCache[processedRow];
            var columnIdx;
            while ((columnIdx = cacheEntry.cellRenderQueue.pop()) != null) {
                node = x.lastElementChild as HTMLElement;

                if (frozenCols > 0 && columnIdx >= frozenCols) {
                    cacheEntry.rowNodeR.appendChild(node);
                } else {
                    cacheEntry.rowNodeL.appendChild(node);
                }

                cacheEntry.cellNodesByColumnIdx[columnIdx] = node;
            }
        }
    }

    private renderRows(range: ViewRange): void {
        var stringArrayL: string[] = [],
            stringArrayR: string[] = [],
            rows = [],
            needToReselectCell = false,
            dataLength = this.getDataLength();

        for (var i = range.top, ii = range.bottom; i <= ii; i++) {
            if (this._rowsCache[i] || (this.hasFrozenRows() && this._options.frozenBottom && i == dataLength)) {
                continue;
            }
            rows.push(i);

            // Create an entry right away so that appendRowHtml() can
            // start populatating it.
            this._rowsCache[i] = {
                rowNodeL: null,
                rowNodeR: null,

                // ColSpans of rendered cells (by column idx).
                // Can also be used for checking whether a cell has been rendered.
                cellColSpans: [],

                // Cell nodes (by column idx).  Lazy-populated by ensureCellNodesInRowsCache().
                cellNodesByColumnIdx: [],

                // Column indices of cell nodes that have been rendered, but not yet indexed in
                // cellNodesByColumnIdx.  These are in the same order as cell nodes added at the
                // end of the row.
                cellRenderQueue: []
            };

            this.appendRowHtml(stringArrayL, stringArrayR, i, range, dataLength);
            if (this._activeCellNode && this._activeRow === i) {
                needToReselectCell = true;
            }
        }

        if (!rows.length) {
            return;
        }

        var l = document.createElement("div"),
            r = document.createElement("div");

        l.innerHTML = stringArrayL.join("");
        r.innerHTML = stringArrayR.join("");

        var frozenRows = this.hasFrozenRows(), actualFrozen = this._actualFrozenRow, frozenCols = this.hasFrozenColumns, frozenBottom = this._options.frozenBottom;
        var ctl = this._canvasTopL, ctr = this._canvasTopR, cbl = this._canvasBottomL, cbr = this._canvasBottomR;
        for (var i = 0, ii = rows.length; i < ii; i++) {
            var row = rows[i];
            var item = this._rowsCache[row];
            item.rowNodeL = l.firstElementChild as HTMLDivElement;
            item.rowNodeR = r.firstElementChild as HTMLDivElement;

            var bottom = frozenRows && row >= actualFrozen;
            if (bottom) {
                item.rowNodeL && cbl.appendChild(item.rowNodeL);
                frozenCols && item.rowNodeR && cbr.appendChild(item.rowNodeR);
            }
            else {
                item.rowNodeL && ctl.appendChild(item.rowNodeL);
                frozenCols && item.rowNodeR && ctr.appendChild(item.rowNodeR);
            }
        }

        if (needToReselectCell) {
            this._activeCellNode = this.getCellNode(this._activeRow, this._activeCell);
        }
    }

    private startPostProcessing(): void {
        if (!this._options.enableAsyncPostRender) {
            return;
        }

        clearTimeout(this._hPostRender);

        if (this._options.asyncPostRenderDelay < 0) {
            this.asyncPostProcessRows();
        } else {
            this._hPostRender = setTimeout(this.asyncPostProcessRows.bind(this), this._options.asyncPostRenderDelay);
        }
    }

    private startPostProcessingCleanup(): void {
        if (!this._options.enableAsyncPostRenderCleanup) {
            return;
        }

        clearTimeout(this._hPostRenderCleanup);

        if (this._options.asyncPostCleanupDelay < 0) {
            this.asyncPostProcessCleanupRows();
        }
        else {
            this._hPostRenderCleanup = setTimeout(this.asyncPostProcessCleanupRows.bind(this), this._options.asyncPostCleanupDelay);
        }
    }

    private invalidatePostProcessingResults(row: number): void {
        if (this._options.enableAsyncPostRenderCleanup) {
            // change status of columns to be re-rendered
            for (var columnIdx in this._postProcessedRows[row]) {
                if (this._postProcessedRows[row].hasOwnProperty(columnIdx)) {
                    this._postProcessedRows[row][columnIdx] = 'C';
                }
            }
        }
        else {
            delete this._postProcessedRows[row];
        }

        this._postProcessFromRow = Math.min(this._postProcessFromRow, row);
        this._postProcessToRow = Math.max(this._postProcessToRow, row);
        this.startPostProcessing();
    }

    private updateRowPositions(): void {
        for (var row in this._rowsCache) {
            var c = this._rowsCache[row];
            var p = this.getRowTop(parseInt(row, 10)) + "px";
            c.rowNodeL && (c.rowNodeL.style.top = p);
            c.rowNodeR && (c.rowNodeR.style.top = p);
        }
    }

    private updateFooterTotals(): void {
        if (!this._options.showFooterRow || !this._initialized)
            return;

        var totals = null;
        if (this._data.getGrandTotals) {
            totals = this._data.getGrandTotals();
        }

        var cols = this._cols;
        for (var i = 0; i < cols.length; i++) {
            var m = cols[i];

            var content;
            if (m.field && totals) {
                content = (m.groupTotalsFormatter && m.groupTotalsFormatter(totals, m, this)) ||
                    (this.groupTotalsFormatter && this.groupTotalsFormatter(totals, m)) || "";
            }

            this.getFooterRowColumn(m.id).innerHTML = content;
        }
    }

    private render(): void {
        if (!this._initialized) { return; }
        var visible = this.getVisibleRange();
        var rendered = this.getRenderedRange();

        // remove rows no longer in the viewport
        this.cleanupRows(rendered);

        // add new rows & missing cells in existing rows
        if (this._scrollLeftRendered != this._scrollLeft) {

            if (this.hasFrozenRows()) {

                var renderedFrozenRows = Object.assign({}, rendered);

                if (this._options.frozenBottom) {
                    renderedFrozenRows.top = this._actualFrozenRow;
                    renderedFrozenRows.bottom = this.getDataLength();
                }
                else {

                    renderedFrozenRows.top = 0;
                    renderedFrozenRows.bottom = this._actualFrozenRow;
                }

                this.cleanUpAndRenderCells(renderedFrozenRows);
            }

            this.cleanUpAndRenderCells(rendered);
        }

        // render missing rows
        this.renderRows(rendered);

        // Render frozen rows
        if (this.hasFrozenRows()) {
            if (this._options.frozenBottom) {
                this.renderRows({
                    top: this._actualFrozenRow,
                    bottom: this.getDataLength() - 1,
                    leftPx: rendered.leftPx,
                    rightPx: rendered.rightPx
                });
            }
            else {
                this.renderRows({
                    top: 0,
                    bottom: this._actualFrozenRow - 1,
                    leftPx: rendered.leftPx,
                    rightPx: rendered.rightPx
                });
            }
        }

        this._postProcessFromRow = visible.top;
        this._postProcessToRow = Math.min(this.getDataLengthIncludingAddNew() - 1, visible.bottom);
        this.startPostProcessing();

        this._scrollTopRendered = this._scrollTop;
        this._scrollLeftRendered = this._scrollLeft;
        this._hRender = null;
    }

    private handleHeaderRowScroll = (): void => {
        if (this._ignoreScrollUntil >= new Date().getTime())
            return;

        var scrollLeft = (this.hasFrozenColumns ? this._headerRowColsR.parentElement.scrollLeft : this._headerRowColsL.parentElement.scrollLeft);
        if (scrollLeft != this._scrollContainerX.scrollLeft) {
            this._scrollContainerX.scrollLeft = scrollLeft;
        }
    }

    private handleFooterRowScroll = (): void => {
        if (this._ignoreScrollUntil >= new Date().getTime())
            return;

        var scrollLeft = (this.hasFrozenColumns ? this._footerRowColsR.parentElement.scrollLeft : this._footerRowColsL.parentElement.scrollLeft);
        if (scrollLeft != this._scrollContainerX.scrollLeft) {
            this._scrollContainerX.scrollLeft = scrollLeft;
        }
    }

    private handleMouseWheel(e: JQueryEventObject, delta: number, deltaX: number, deltaY: number): void {
        if (this._ignoreScrollUntil >= new Date().getTime())
            return;

        deltaX = (typeof deltaX == "undefined" ? (e as any).originalEvent.deltaX : deltaX) || 0;
        deltaY = (typeof deltaY == "undefined" ? (e as any).originalEvent.deltaY : deltaY) || 0;
        this._scrollTop = Math.max(0, this._scrollContainerY.scrollTop - (deltaY * this._options.rowHeight));
        this._scrollLeft = this._scrollContainerX.scrollLeft + (deltaX * 10);
        var handled = this._handleScroll(true);
        if (handled)
            e.preventDefault();
    }

    private handleScroll(): boolean {
        if (this._ignoreScrollUntil >= new Date().getTime())
            return;

        this._scrollTop = this._scrollContainerY.scrollTop;
        this._scrollLeft = this._scrollContainerX.scrollLeft;
        return this._handleScroll(false);
    }

    private _handleScroll(isMouseWheel?: boolean): boolean {
        var maxScrollDistanceY = this._scrollContainerY.scrollHeight - this._scrollContainerY.clientHeight;
        var maxScrollDistanceX = this._scrollContainerY.scrollWidth - this._scrollContainerY.clientWidth;

        // Protect against erroneous clientHeight/Width greater than scrollHeight/Width.
        // Sometimes seen in Chrome.
        maxScrollDistanceY = Math.max(0, maxScrollDistanceY);
        maxScrollDistanceX = Math.max(0, maxScrollDistanceX);

        // Ceiling the max scroll values
        if (this._scrollTop > maxScrollDistanceY) {
            this._scrollTop = maxScrollDistanceY;
        }
        if (this._scrollLeft > maxScrollDistanceX) {
            this._scrollLeft = maxScrollDistanceX;
        }

        var vScrollDist = Math.abs(this._scrollTop - this._scrollTopPrev);
        var hScrollDist = Math.abs(this._scrollLeft - this._scrollLeftPrev);

        if (hScrollDist || vScrollDist)
            this._ignoreScrollUntil = new Date().getTime() + 100;

        if (hScrollDist) {
            this._scrollLeftPrev = this._scrollLeft;

            this._scrollContainerX.scrollLeft = this._scrollLeft;

            this._layout.handleScrollH();
        }

        if (vScrollDist) {
            this._vScrollDir = this._scrollTopPrev < this._scrollTop ? 1 : -1;
            this._scrollTopPrev = this._scrollTop;

            if (isMouseWheel) {
                this._scrollContainerY.scrollTop = this._scrollTop;
            }

            this._layout.handleScrollV;

            // switch virtual pages if needed
            if (vScrollDist < this._viewportH) {
                this.scrollTo(this._scrollTop + this._pageOffset);
            } else {
                var oldOffset = this._pageOffset;
                if (this._realScrollHeight == this._viewportH) {
                    this._page = 0;
                } else {
                    this._page = Math.min(this._numberOfPages - 1, Math.floor(this._scrollTop * ((this._virtualHeight - this._viewportH) / (this._realScrollHeight - this._viewportH)) * (1 / this._pageHeight)));
                }
                this._pageOffset = Math.round(this._page * this._jumpinessCoefficient);
                if (oldOffset != this._pageOffset) {
                    this.invalidateAllRows();
                }
            }
        }

        if (hScrollDist || vScrollDist) {
            if (this._hRender) {
                clearTimeout(this._hRender);
            }

            if (Math.abs(this._scrollTopRendered - this._scrollTop) > 20 ||
                Math.abs(this._scrollLeftRendered - this._scrollLeft) > 20) {
                if (this._options.forceSyncScrolling || (
                    Math.abs(this._scrollTopRendered - this._scrollTop) < this._viewportH &&
                    Math.abs(this._scrollLeftRendered - this._scrollLeft) < this._viewportW)) {
                    this.render();
                } else {
                    this._hRender = setTimeout(this.render.bind(this), 50);
                }

                this.trigger(this.onViewportChanged);
            }
        }

        this.trigger(this.onScroll, { scrollLeft: this._scrollLeft, scrollTop: this._scrollTop });

        return !!(hScrollDist || vScrollDist);
    }

    private asyncPostProcessRows(): void {
        var dataLength = this.getDataLength();
        var cols = this._cols;
        while (this._postProcessFromRow <= this._postProcessToRow) {
            var row = (this._vScrollDir >= 0) ? this._postProcessFromRow++ : this._postProcessToRow--;
            var cacheEntry = this._rowsCache[row];
            if (!cacheEntry || row >= dataLength) {
                continue;
            }

            if (!this._postProcessedRows[row]) {
                this._postProcessedRows[row] = {};
            }

            this.ensureCellNodesInRowsCache(row);
            for (var x in cacheEntry.cellNodesByColumnIdx) {
                if (!cacheEntry.cellNodesByColumnIdx.hasOwnProperty(x)) {
                    continue;
                }

                var columnIdx = parseInt(x, 10);

                var m = cols[columnIdx];
                var processedStatus = this._postProcessedRows[row][columnIdx]; // C=cleanup and re-render, R=render
                if (processedStatus !== 'R') {
                    if (m.asyncPostRender || m.asyncPostRenderCleanup) {
                        var node = cacheEntry.cellNodesByColumnIdx[columnIdx];
                        if (node) {
                            m.asyncPostRender && m.asyncPostRender(node, row, this.getDataItem(row), m, processedStatus === 'C');
                        }
                    }
                    this._postProcessedRows[row][columnIdx] = 'R';
                }
            }

            if (this._options.asyncPostRenderDelay >= 0) {
                this._hPostRender = setTimeout(this.asyncPostProcessRows.bind(this), this._options.asyncPostRenderDelay);
                return;
            }
        }
    }

    private asyncPostProcessCleanupRows(): void {
        var cols = this._cols;
        while (this._postProcessCleanupQueue.length > 0) {
            var groupId = this._postProcessCleanupQueue[0].groupId;

            // loop through all queue members with this groupID
            while (this._postProcessCleanupQueue.length > 0 && this._postProcessCleanupQueue[0].groupId == groupId) {
                var entry = this._postProcessCleanupQueue.shift();
                entry.rowNodeL && entry.rowNodeL.remove();
                entry.rowNodeR && entry.rowNodeR.remove();
                if (entry.cellNode != null) {
                    var column = cols[entry.columnIdx];
                    if (column && column.asyncPostRenderCleanup) {
                        column.asyncPostRenderCleanup(entry.cellNode, entry.rowIdx, column);
                        entry.cellNode.remove();
                    }
                }
            }

            // call this function again after the specified delay
            if (this._options.asyncPostRenderDelay >= 0) {
                this._hPostRenderCleanup = setTimeout(this.asyncPostProcessCleanupRows.bind(this), this._options.asyncPostCleanupDelay);
                return;
            }
        }
    }

    private updateCellCssStylesOnRenderedRows(addedHash: CellStylesHash, removedHash: CellStylesHash) {
        var node, columnId, addedRowHash, removedRowHash;
        for (var row in this._rowsCache) {
            removedRowHash = removedHash && removedHash[row];
            addedRowHash = addedHash && addedHash[row];

            if (removedRowHash) {
                for (columnId in removedRowHash) {
                    if (!addedRowHash || removedRowHash[columnId] != addedRowHash[columnId]) {
                        node = this.getCellNode(parseInt(row, 10), this.getColumnIndex(columnId));
                        if (node) {
                            $(node).removeClass(removedRowHash[columnId]);
                        }
                    }
                }
            }

            if (addedRowHash) {
                for (columnId in addedRowHash) {
                    if (!removedRowHash || removedRowHash[columnId] != addedRowHash[columnId]) {
                        node = this.getCellNode(parseInt(row, 10), this.getColumnIndex(columnId));
                        if (node) {
                            $(node).addClass(addedRowHash[columnId]);
                        }
                    }
                }
            }
        }
    }

    addCellCssStyles(key: string, hash: CellStylesHash): void {
        if (this._cellCssClasses[key]) {
            throw "addCellCssStyles: cell CSS hash with key '" + key + "' already exists.";
        }

        this._cellCssClasses[key] = hash;
        this.updateCellCssStylesOnRenderedRows(hash, null);

        this.trigger(this.onCellCssStylesChanged, { key: key, hash: hash });
    }

    removeCellCssStyles(key: string): void {
        if (!this._cellCssClasses[key]) {
            return;
        }

        this.updateCellCssStylesOnRenderedRows(null, this._cellCssClasses[key]);
        delete this._cellCssClasses[key];

        this.trigger(this.onCellCssStylesChanged, { key: key, hash: null });
    }

    setCellCssStyles(key: string, hash: CellStylesHash): void {
        var prevHash = this._cellCssClasses[key];

        this._cellCssClasses[key] = hash;
        this.updateCellCssStylesOnRenderedRows(hash, prevHash);

        this.trigger(this.onCellCssStylesChanged, { key: key, hash: hash });
    }

    getCellCssStyles(key: string): CellStylesHash {
        return this._cellCssClasses[key];
    }

    flashCell(row: number, cell: number, speed?: number): void {
        speed = speed || 100;
        if (this._rowsCache[row]) {
            var $cell = $(this.getCellNode(row, cell));
            toggleCellClass(4);
        }

        var klass = this._options.cellFlashingCssClass;

        function toggleCellClass(times: number) {
            if (!times) {
                return;
            }
            setTimeout(function () {
                $cell.queue(function () {
                    $cell.toggleClass(klass).dequeue();
                    toggleCellClass(times - 1);
                });
            }, speed);
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Interactivity

    private handleDragInit(e: JQueryEventObject, dd: any): boolean {
        var cell = this.getCellFromEvent(e);
        if (!cell || !this.cellExists(cell.row, cell.cell)) {
            return false;
        }

        var retval = this.trigger(this.onDragInit, dd, e);
        if (e.isImmediatePropagationStopped && e.isImmediatePropagationStopped()) {
            return retval;
        }

        // if nobody claims to be handling drag'n'drop by stopping immediate propagation,
        // cancel out of it
        return false;
    }

    private handleDragStart(e: JQueryEventObject, dd: any): boolean {
        var cell = this.getCellFromEvent(e);
        if (!cell || !this.cellExists(cell.row, cell.cell)) {
            return false;
        }

        var retval = this.trigger(this.onDragStart, dd, e);
        if (e.isImmediatePropagationStopped && e.isImmediatePropagationStopped()) {
            return retval;
        }

        return false;
    }

    private handleDrag(e: JQueryEventObject, dd: any): any {
        return this.trigger(this.onDrag, dd, e);
    }

    private handleDragEnd(e: JQueryEventObject, dd: any): void {
        this.trigger(this.onDragEnd, dd, e);
    }

    private handleKeyDown(e: JQueryKeyEventObject): void {
        this.trigger(this.onKeyDown, { row: this._activeRow, cell: this._activeCell }, e);
        var handled = e.isImmediatePropagationStopped && e.isImmediatePropagationStopped();

        if (!handled) {
            if (!e.shiftKey && !e.altKey) {
                if (this._options.editable && this._currentEditor && this._currentEditor.keyCaptureList) {
                    if (this._currentEditor.keyCaptureList.indexOf(e.which) >= 0) {
                        return;
                    }
                }

                if (e.which == keyCode.HOME) {
                    if (e.ctrlKey) {
                        this.navigateTop();
                        handled = true;
                    }
                    else
                        handled = this.navigateRowStart();
                }
                else if (e.which == keyCode.END) {
                    if (e.ctrlKey) {
                        this.navigateBottom();
                        handled = true;
                    }
                    else
                        handled = this.navigateRowEnd();
                }
            }
        }

        if (!handled) {
            if (!e.shiftKey && !e.altKey && !e.ctrlKey) {

                if (this._options.editable && this._currentEditor && this._currentEditor.keyCaptureList) {
                    if (this._currentEditor.keyCaptureList.indexOf(e.which) >= 0) {
                        return;
                    }
                }

                if (e.which == keyCode.ESCAPE) {
                    if (!this.getEditorLock().isActive()) {
                        return; // no editing mode to cancel, allow bubbling and default processing (exit without cancelling the event)
                    }
                    this.cancelEditAndSetFocus();
                } else if (e.which == keyCode.PAGEDOWN) {
                    this.navigatePageDown();
                    handled = true;
                } else if (e.which == keyCode.PAGEUP) {
                    this.navigatePageUp();
                    handled = true;
                } else if (e.which == keyCode.LEFT) {
                    handled = this.navigateLeft();
                } else if (e.which == keyCode.RIGHT) {
                    handled = this.navigateRight();
                } else if (e.which == keyCode.UP) {
                    handled = this.navigateUp();
                } else if (e.which == keyCode.DOWN) {
                    handled = this.navigateDown();
                } else if (e.which == keyCode.TAB) {
                    if (this._options.enableTabKeyNavigation)
                        handled = this.navigateNext();
                } else if (e.which == keyCode.ENTER) {
                    if (this._options.editable) {
                        if (this._currentEditor) {
                            // adding new row
                            if (this._activeRow === this.getDataLength()) {
                                this.navigateDown();
                            } else {
                                this.commitEditAndSetFocus();
                            }
                        } else {
                            if (this.getEditorLock().commitCurrentEdit()) {
                                this.makeActiveCellEditable();
                            }
                        }
                    }
                    handled = true;
                }
            } else if (e.which == keyCode.TAB && e.shiftKey && !e.ctrlKey && !e.altKey) {
                handled = this.navigatePrev();
            }
        }

        if (handled) {
            // the event has been handled so don't let parent element (bubbling/propagation) or browser (default) handle it
            e.stopPropagation();
            e.preventDefault();
            try {
                (e.originalEvent as JQueryKeyEventObject).keyCode = 0; // prevent default behaviour for special keys in IE browsers (F3, F5, etc.)
            }
            // ignore exceptions - setting the original event's keycode throws access denied exception for "Ctrl"
            // (hitting control key only, nothing else), "Shift" (maybe others)
            catch (error) {
            }
        }
    }

    private handleClick(e: JQueryMouseEventObject): void {
        if (!this._currentEditor) {
            // if this click resulted in some cell child node getting focus,
            // don't steal it back - keyboard events will still bubble up
            // IE9+ seems to default DIVs to tabIndex=0 instead of -1, so check for cell clicks directly.
            if (e.target != document.activeElement || $(e.target).hasClass("slick-cell")) {
                this.setFocus();
            }
        }

        var cell = this.getCellFromEvent(e as any);
        if (!cell || (this._currentEditor != null && this._activeRow == cell.row && this._activeCell == cell.cell)) {
            return;
        }

        this.trigger(this.onClick, { row: cell.row, cell: cell.cell }, e);
        if (e.isImmediatePropagationStopped && e.isImmediatePropagationStopped()) {
            return;
        }

        if (this.canCellBeActive(cell.row, cell.cell)) {
            if (!this.getEditorLock().isActive() || this.getEditorLock().commitCurrentEdit()) {

                var preClickModeOn = (e.target && e.target.classList.contains(preClickClassName));
                var column = this._cols[cell.cell];
                var suppressActiveCellChangedEvent = !!(this._options.editable && column && column.editor && this._options.suppressActiveCellChangeOnEdit);
                this.setActiveCellInternal(this.getCellNode(cell.row, cell.cell), null, preClickModeOn, suppressActiveCellChangedEvent, e);
            }
        }
    }

    private handleContextMenu(e: JQueryMouseEventObject): void {
        var $cell = $(e.target).closest(".slick-cell", this._container);
        if ($cell.length === 0) {
            return;
        }

        // are we editing this cell?
        if (this._activeCellNode === $cell[0] && this._currentEditor != null) {
            return;
        }

        this.trigger(this.onContextMenu, {}, e);
    }

    private handleDblClick(e: JQueryMouseEventObject): void {
        var cell = this.getCellFromEvent(e as any);
        if (!cell || (this._currentEditor != null && this._activeRow == cell.row && this._activeCell == cell.cell)) {
            return;
        }

        this.trigger(this.onDblClick, { row: cell.row, cell: cell.cell }, e);
        if (e.isImmediatePropagationStopped && e.isImmediatePropagationStopped()) {
            return;
        }

        if (this._options.editable) {
            this.gotoCell(cell.row, cell.cell, true);
        }
    }

    private handleHeaderMouseEnter(e: MouseEvent): void {
        const column = this.getColumnFromNode(e.target as HTMLElement)
        column && this.trigger(this.onHeaderMouseEnter, { column }, e);
    }

    private handleHeaderMouseLeave(e: MouseEvent): void {
        const column = this.getColumnFromNode(e.target as HTMLElement)
        column && this.trigger(this.onHeaderMouseLeave, { column }, e);
    }

    private handleHeaderContextMenu(e: JQueryMouseEventObject): void {
        var header = e.target.closest(".slick-header-column");
        var column = this.getColumnFromNode(header);
        column && this.trigger(this.onHeaderContextMenu, { column }, e);
    }

    private handleHeaderClick(e: JQueryMouseEventObject): void {
        var header = e.target.closest(".slick-header-column");
        var column = this.getColumnFromNode(header);
        column && this.trigger(this.onHeaderClick, { column: column }, e);
    }

    private handleMouseEnter(e: MouseEvent): void {
        this.trigger(this.onMouseEnter, {}, e);
    }

    private handleMouseLeave(e: MouseEvent): void {
        this.trigger(this.onMouseLeave, {}, e);
    }

    private cellExists(row: number, cell: number): boolean {
        return !(row < 0 || row >= this.getDataLength() || cell < 0 || cell >= this._cols.length);
    }

    getCellFromPoint(x: number, y: number): { row: number; cell: number; } {
        var row = this.getRowFromPosition(y);
        var cell = 0;
        var cols = this._cols;
        var w = 0;
        for (var i = 0; i < cols.length && w < x; i++) {
            w += cols[i].width;
            cell++;
        }

        if (cell < 0) {
            cell = 0;
        }

        return { row: row, cell: cell - 1 };
    }

    getCellFromNode(cellNode: Element): number {
        if (cellNode == null)
            return null;

        var c = (cellNode as HTMLElement).dataset.c;
        if (c != null)
            return parseInt(c, 10);

        // read column number from .l<columnNumber> CSS class
        var cls = /\sl(\d+)\s/.exec(' ' + cellNode.className + ' ');
        if (!cls) {
            return null;
        }
        return parseInt(cls[1], 10);
    }

    getColumnFromNode(cellNode: Element): Column<TItem> {
        if (cellNode == null)
            return null;

        var cell = this.getCellFromNode(cellNode);
        if (cell === null && this._hasJQuery)
            return $(cell).data("column") as Column<TItem>;

        return this._cols[cell];
    }

    getRowFromNode(rowNode: Element): number {
        if (rowNode != null) {
            for (var row in this._rowsCache) {
                var c = this._rowsCache[row];
                if (c.rowNodeL === rowNode || c.rowNodeR === rowNode)
                    return parseInt(row, 10);
            }
        }
        return null;
    }

    private getFrozenRowOffset(row: number): any {
        if (!this.hasFrozenRows() || row < this._actualFrozenRow)
            return 0;

        if (!this._options.frozenBottom)
            return this._frozenRows * this._options.rowHeight;

        if (this._realScrollHeight >= this._viewportTopH)
            return this._realScrollHeight;

        return this._actualFrozenRow * this._options.rowHeight;
    }

    getCellFromEvent(e: any): { row: number; cell: number; } {
        var row, cell;
        var cellEl = (e.target as HTMLElement).closest(".slick-cell") as HTMLElement;
        if (!cellEl) {
            return null;
        }

        row = this.getRowFromNode(cellEl.parentNode as HTMLElement);

        if (this.hasFrozenRows()) {

            var bcr = cellEl.closest('.grid-canvas').getBoundingClientRect();

            var rowOffset = 0;
            var isBottom = cellEl.closest('.grid-canvas-bottom') != null;

            if (isBottom) {
                rowOffset = (this._options.frozenBottom) ? Math.round(parseFloat(getComputedStyle(this._canvasTopL).height)) : (this._frozenRows * this._options.rowHeight);
            }

            row = this.getCellFromPoint(e.clientX - bcr[this._rtlS] - document.body.scrollLeft, e.clientY - bcr.top + document.body.scrollTop + rowOffset + document.body.scrollTop).row;
        }

        cell = this.getCellFromNode(cellEl);

        if (row == null || cell == null) {
            return null;
        } else {
            return {
                "row": row,
                "cell": cell
            };
        }
    }

    getCellNodeBox(row: number, cell: number): { top: number; right: number; bottom: number; left: number; } {
        if (!this.cellExists(row, cell)) {
            return null;
        }

        var frozenRowOffset = this.getFrozenRowOffset(row);
        var cols = this._cols, frozenCols = this._frozenCols;
        var y1 = this.getRowTop(row) - frozenRowOffset;
        var y2 = y1 + this._options.rowHeight - 1;
        var x1 = 0;
        for (var i = 0; i < cell; i++) {
            x1 += cols[i].width;
            if (i == frozenCols - 1) {
                x1 = 0;
            }
        }
        var x2 = x1 + cols[cell].width;

        return this._rtl ? {
            top: y1,
            right: x1,
            bottom: y2,
            left: x2
        } : {
            top: y1,
            left: x1,
            bottom: y2,
            right: x2
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Cell switching

    resetActiveCell(): void {
        this.setActiveCellInternal(null, false);
    }

    focus(): void {
        this.setFocus();
    }

    private setFocus(): void {
        if (this._tabbingDirection == -1) {
            this._focusSink1.focus();
        } else {
            this._focusSink2.focus();
        }
    }

    scrollCellIntoView(row: number, cell: number, doPaging?: boolean): void {
        this.scrollRowIntoView(row, doPaging);

        if (cell < this._frozenCols)
            return;

        var colspan = this.getColspan(row, cell);
        this.internalScrollColumnIntoView(this._colLeft[cell], this._colRight[cell + (colspan > 1 ? colspan - 1 : 0)]);
    }

    scrollColumnIntoView(cell: number): void {
        this.internalScrollColumnIntoView(this._colLeft[cell], this._colRight[cell]);
    }

    internalScrollColumnIntoView(left: number, right: number): void {

        var scrollRight = this._scrollLeft + parseFloat(getComputedStyle(this._scrollContainerX).width) -
            (this._viewportHasVScroll ? this._scrollDims.width : 0);

        var target;
        if (left < this._scrollLeft)
            target = left;
        else if (right > scrollRight)
            target = Math.min(left, right - this._scrollContainerX.clientWidth);
        else
            return;

        this._scrollContainerX.scrollLeft = target;
        this.handleScroll();
        this.render();
    }

    private setActiveCellInternal(newCell: HTMLElement, opt_editMode?: boolean, preClickModeOn?: boolean, suppressActiveCellChangedEvent?: boolean, e?: any): void {
        if (this._activeCellNode != null) {
            this.makeActiveCellNormal();
            this._activeCellNode.classList.remove("active");
            var c = this._rowsCache[this._activeRow];
            if (c) {
                c.rowNodeL && c.rowNodeL.classList.remove("active");
                c.rowNodeR && c.rowNodeR.classList.remove("active");
            }
        }

        this._activeCellNode = newCell;

        if (this._activeCellNode != null) {
            var bcl = this._activeCellNode.getBoundingClientRect();

            var rowOffset = Math.floor(this._activeCellNode.closest('.grid-canvas').getBoundingClientRect().top + document.body.scrollTop);
            var isBottom = this._activeCellNode.closest('.grid-canvas-bottom') != null;

            if (this.hasFrozenRows() && isBottom) {
                rowOffset -= (this._options.frozenBottom)
                    ? Math.round(parseFloat(getComputedStyle(this._canvasTopL).height))
                    : this._frozenRows * this._options.rowHeight;
            }

            var cell = this.getCellFromPoint(bcl[this._rtlS] + document.body.scrollLeft, Math.ceil(bcl.top + document.body.scrollTop) - rowOffset);

            this._activeRow = cell.row;
            this._activeCell = this._activePosX = this.getCellFromNode(this._activeCellNode);

            if (this._options.showCellSelection) {
                this._activeCellNode.classList.add("active");
                var c = this._rowsCache[this._activeRow];
                if (c) {
                    c.rowNodeL && c.rowNodeL.classList.add("active");
                    c.rowNodeR && c.rowNodeR.classList.add("active");
                }
            }

            if (opt_editMode == null) {
                opt_editMode = (this._activeRow == this.getDataLength()) || this._options.autoEdit;
            }

            if (this._options.editable && opt_editMode && this.isCellPotentiallyEditable(this._activeRow, this._activeCell)) {
                clearTimeout(this._hEditorLoader);

                if (this._options.asyncEditorLoading) {
                    this._hEditorLoader = setTimeout(() => {
                        this.makeActiveCellEditable(undefined, preClickModeOn, e);
                    }, this._options.asyncEditorLoadDelay);
                } else {
                    this.makeActiveCellEditable(undefined, preClickModeOn, e);
                }
            }
        } else {
            this._activeRow = this._activeCell = null;
        }

        if (!suppressActiveCellChangedEvent) {
            this.trigger(this.onActiveCellChanged, this.getActiveCell() as ArgsCell);
        }
    }

    clearTextSelection(): void {
        if ((document as any).selection && (document as any).selection.empty) {
            try {
                //IE fails here if selected element is not in dom
                (document as any).selection.empty();
            } catch (e) { }
        } else if (window.getSelection) {
            var sel = window.getSelection();
            if (sel && sel.removeAllRanges) {
                sel.removeAllRanges();
            }
        }
    }

    private isCellPotentiallyEditable(row: number, cell: number): boolean {
        var dataLength = this.getDataLength();
        // is the data for this row loaded?
        if (row < dataLength && !this.getDataItem(row)) {
            return false;
        }

        // are we in the Add New row?  can we create new from this cell?
        if (this._cols[cell].cannotTriggerInsert && row >= dataLength) {
            return false;
        }

        // does this cell have an editor?
        if (!this.getEditor(row, cell)) {
            return false;
        }

        return true;
    }

    private makeActiveCellNormal(): void {
        if (!this._currentEditor) {
            return;
        }
        this.trigger(this.onBeforeCellEditorDestroy, { editor: this._currentEditor });
        this._currentEditor.destroy();
        this._currentEditor = null;

        if (this._activeCellNode) {
            var d = this.getDataItem(this._activeRow);
            this._activeCellNode.classList.remove("editable", "invalid");
            if (d) {
                var column = this._cols[this._activeCell];
                var fmtResult = d ? this.getFormatter(this._activeRow, column)(this._activeRow, this._activeCell,
                    this.getDataItemValueForColumn(d, column), column, d) : "";
                this.applyFormatResultToCellNode(fmtResult, this._activeCellNode);
                this.invalidatePostProcessingResults(this._activeRow);
            }
        }

        // if there previously was text selected on a page (such as selected text in the edit cell just removed),
        // IE can't set focus to anything else correctly
        if (navigator.userAgent.toLowerCase().match(/msie/)) {
            this.clearTextSelection();
        }

        this.getEditorLock().deactivate(this._editController);
    }

    editActiveCell(editor?: Editor): void {
        this.makeActiveCellEditable(editor);
    }

    private makeActiveCellEditable(editor?: Editor, preClickModeOn?: boolean, e?: any): void {
        if (!this._activeCellNode) {
            return;
        }
        if (!this._options.editable) {
            throw "Grid : makeActiveCellEditable : should never get called when options.editable is false";
        }

        // cancel pending async call if there is one
        clearTimeout(this._hEditorLoader);

        if (!this.isCellPotentiallyEditable(this._activeRow, this._activeCell)) {
            return;
        }

        var columnDef = this._cols[this._activeCell];
        var item = this.getDataItem(this._activeRow);

        if (this.trigger(this.onBeforeEditCell, { row: this._activeRow, cell: this._activeCell, item: item, column: columnDef }) === false) {
            this.setFocus();
            return;
        }

        this.getEditorLock().activate(this._editController);
        this._activeCellNode.classList.add("editable");

        var useEditor = editor || this.getEditor(this._activeRow, this._activeCell);

        // don't clear the cell if a custom editor is passed through
        if (!editor && !useEditor.suppressClearOnEdit) {
            this._activeCellNode.innerHTML = "";
        }

        var itemMetadata = this._data.getItemMetadata && this._data.getItemMetadata(this._activeRow) as ItemMetadata;
        var colsMetadata = itemMetadata && itemMetadata.columns;
        var columnMetadata = colsMetadata && (colsMetadata[columnDef.id] || colsMetadata[this._activeCell]);

        this._currentEditor = new useEditor({
            grid: this,
            gridPosition: this.absBox(this._container),
            position: this.absBox(this._activeCellNode),
            container: this._activeCellNode,
            column: columnDef,
            columnMetaData: columnMetadata,
            item: item || {},
            event: e,
            commitChanges: this.commitEditAndSetFocus.bind(this),
            cancelChanges: this.cancelEditAndSetFocus.bind(this)
        });

        if (item) {
            this._currentEditor.loadValue(item);
            if (preClickModeOn && this._currentEditor.preClick) {
                this._currentEditor.preClick();
            }
        }

        this._serializedEditorValue = this._currentEditor.serializeValue();

        if (this._currentEditor.position) {
            this.handleActiveCellPositionChange();
        }
    }

    private commitEditAndSetFocus(): void {
        // if the commit fails, it would do so due to a validation error
        // if so, do not steal the focus from the editor
        if (this.getEditorLock().commitCurrentEdit()) {
            this.setFocus();
            if (this._options.autoEdit) {
                this.navigateDown();
            }
        }
    }

    private cancelEditAndSetFocus(): void {
        if (this.getEditorLock().cancelCurrentEdit()) {
            this.setFocus();
        }
    }

    private absBox(elem: HTMLElement): Position {
        var box: Position = {
            top: elem.offsetTop,
            left: elem.offsetLeft,
            bottom: 0,
            right: 0,
            width: elem.offsetWidth,
            height: elem.offsetHeight,
            visible: true
        };

        box.bottom = box.top + box.height;
        box.right = box.left + box.width;

        // walk up the tree
        var offsetParent = elem.offsetParent;
        while ((elem = elem.parentNode as HTMLElement) != document.body) {
            if (box.visible && elem.scrollHeight != elem.offsetHeight && getComputedStyle(elem).overflowY !== "visible") {
                box.visible = box.bottom > elem.scrollTop && box.top < elem.scrollTop + elem.clientHeight;
            }

            if (box.visible && elem.scrollWidth != elem.offsetWidth && getComputedStyle(elem).overflowX != "visible") {
                box.visible = box.right > elem.scrollLeft && box.left < elem.scrollLeft + elem.clientWidth;
            }

            box.left -= elem.scrollLeft;
            box.top -= elem.scrollTop;

            if (elem === offsetParent) {
                box.left += elem.offsetLeft;
                box.top += elem.offsetTop;
                offsetParent = elem.offsetParent;
            }

            box.bottom = box.top + box.height;
            box.right = box.left + box.width;
        }

        return box;
    }

    private getActiveCellPosition(): Position {
        return this.absBox(this._activeCellNode);
    }

    getGridPosition(): Position {
        return this.absBox(this._container);
    }

    private handleActiveCellPositionChange = (): void => {
        if (!this._activeCellNode) {
            return;
        }

        this.trigger(this.onActiveCellPositionChanged, {});

        if (this._currentEditor) {
            var cellBox = this.getActiveCellPosition();
            if (this._currentEditor.show && this._currentEditor.hide) {
                if (!cellBox.visible) {
                    this._currentEditor.hide();
                } else {
                    this._currentEditor.show();
                }
            }

            if (this._currentEditor.position) {
                this._currentEditor.position(cellBox);
            }
        }
    }

    getCellEditor(): Editor {
        return this._currentEditor;
    }

    getActiveCell(): RowCell {
        if (!this._activeCellNode) {
            return null;
        } else {
            return { row: this._activeRow, cell: this._activeCell };
        }
    }

    getActiveCellNode(): HTMLElement {
        return this._activeCellNode;
    }

    scrollActiveCellIntoView(): void {
        if (this._activeRow != null && this._activeCell != null) {
            this.scrollCellIntoView(this._activeRow, this._activeCell);
        }
    }

    scrollRowIntoView(row: number, doPaging?: boolean): void {

        if (!this.hasFrozenRows() ||
            (!this._options.frozenBottom && row > this._actualFrozenRow - 1) ||
            (this._options.frozenBottom && row < this._actualFrozenRow - 1)) {

            var viewportScrollH = Math.round(parseFloat(getComputedStyle(this._scrollContainerY).height));

            var rowNumber = (this.hasFrozenRows() && !this._options.frozenBottom ? row - this._frozenRows + 1 : row);

            // if frozen row on top subtract number of frozen row
            var rowAtTop = rowNumber * this._options.rowHeight;
            var rowAtBottom = (rowNumber + 1) * this._options.rowHeight
                - viewportScrollH
                + (this._viewportHasHScroll ? this._scrollDims.height : 0);

            // need to page down?
            if ((rowNumber + 1) * this._options.rowHeight > this._scrollTop + viewportScrollH + this._pageOffset) {
                this.scrollTo(doPaging ? rowAtTop : rowAtBottom);
                this.render();
            }
            // or page up?
            else if (rowNumber * this._options.rowHeight < this._scrollTop + this._pageOffset) {
                this.scrollTo(doPaging ? rowAtBottom : rowAtTop);
                this.render();
            }
        }
    }

    scrollRowToTop(row: number): void {
        this.scrollTo(row * this._options.rowHeight);
        this.render();
    }

    private scrollPage(dir: number): void {
        var deltaRows = dir * this._numVisibleRows;
        this.scrollTo((this.getRowFromPosition(this._scrollTop) + deltaRows) * this._options.rowHeight);
        this.render();

        if (this._options.enableCellNavigation && this._activeRow != null) {
            var row = this._activeRow + deltaRows;
            var dataLengthIncludingAddNew = this.getDataLengthIncludingAddNew();
            if (row >= dataLengthIncludingAddNew) {
                row = dataLengthIncludingAddNew - 1;
            }
            if (row < 0) {
                row = 0;
            }

            var cell = 0, prevCell = null;
            var prevActivePosX = this._activePosX;
            while (cell <= this._activePosX) {
                if (this.canCellBeActive(row, cell)) {
                    prevCell = cell;
                }
                cell += this.getColspan(row, cell);
            }

            if (prevCell != null) {
                this.setActiveCellInternal(this.getCellNode(row, prevCell));
                this._activePosX = prevActivePosX;
            } else {
                this.resetActiveCell();
            }
        }
    }

    navigatePageDown(): void {
        this.scrollPage(1);
    }

    navigatePageUp(): void {
        this.scrollPage(-1);
    }

    navigateTop(): void {
        this.navigateToRow(0);
    }

    navigateBottom(): void {
        this.navigateToRow(this.getDataLength() - 1);
    }

    navigateToRow(row: number) {
        var dataLength = this.getDataLength();
        if (!dataLength) {
            return true;
        }

        if (row < 0)
            row = 0;
        else if (row >= dataLength)
            row = dataLength - 1;

        this.scrollCellIntoView(row, 0, true);

        if (this._options.enableCellNavigation && this._activeRow != null) {
            var cell = 0, prevCell = null;
            var prevActivePosX = this._activePosX;
            while (cell <= this._activePosX) {
                if (this.canCellBeActive(row, cell))
                    prevCell = cell;
                cell += this.getColspan(row, cell);
            }

            if (prevCell != null) {
                this.setActiveCellInternal(this.getCellNode(row, prevCell));
                this._activePosX = prevActivePosX;
            }
            else
                this.resetActiveCell();
        }

        return true;
    }

    getColspan(row: number, cell: number): number {
        var itemMetadata = this._data.getItemMetadata && this._data.getItemMetadata(row) as ItemMetadata;
        if (!itemMetadata || !itemMetadata.columns) {
            return 1;
        }

        var cols = this._cols;
        var columnData = cols[cell] && (itemMetadata.columns[cols[cell].id] || itemMetadata.columns[cell]);
        var colspan = (columnData && columnData.colspan);
        if (colspan === "*") {
            colspan = cols.length - cell;
        } else {
            colspan = colspan || 1;
        }

        return colspan;
    }

    private findFirstFocusableCell(row: number): number {
        var cell = 0;
        var cols = this._cols;
        while (cell < cols.length) {
            if (this.canCellBeActive(row, cell)) {
                return cell;
            }
            cell += this.getColspan(row, cell);
        }
        return null;
    }

    private findLastFocusableCell(row: number): number {
        var cell = 0;
        var lastFocusableCell = null;
        var cols = this._cols;
        while (cell < cols.length) {
            if (this.canCellBeActive(row, cell)) {
                lastFocusableCell = cell;
            }
            cell += this.getColspan(row, cell);
        }
        return lastFocusableCell;
    }

    private gotoRight(row?: number, cell?: number, posX?: number): GoToResult {
        var cols = this._cols;
        if (cell >= cols.length) {
            return null;
        }

        do {
            cell += this.getColspan(row, cell);
        }
        while (cell < cols.length && !this.canCellBeActive(row, cell));

        if (cell < cols.length) {
            return {
                row: row,
                cell: cell,
                posX: cell
            };
        }
        return null;
    }

    private gotoLeft(row?: number, cell?: number, posX?: number): GoToResult {
        if (cell <= 0) {
            return null;
        }

        var firstFocusableCell = this.findFirstFocusableCell(row);
        if (firstFocusableCell === null || firstFocusableCell >= cell) {
            return null;
        }

        var prev = {
            row: row,
            cell: firstFocusableCell,
            posX: firstFocusableCell
        };
        var pos;
        while (true) {
            pos = this.gotoRight(prev.row, prev.cell, prev.posX);
            if (!pos) {
                return null;
            }
            if (pos.cell >= cell) {
                return prev;
            }
            prev = pos;
        }
    }

    private gotoDown(row?: number, cell?: number, posX?: number): GoToResult {
        var prevCell;
        var dataLengthIncludingAddNew = this.getDataLengthIncludingAddNew();
        while (true) {
            if (++row >= dataLengthIncludingAddNew) {
                return null;
            }

            prevCell = cell = 0;
            while (cell <= posX) {
                prevCell = cell;
                cell += this.getColspan(row, cell);
            }

            if (this.canCellBeActive(row, prevCell)) {
                return {
                    row: row,
                    cell: prevCell,
                    posX: posX
                };
            }
        }
    }

    private gotoUp(row?: number, cell?: number, posX?: number): GoToResult {
        var prevCell;
        while (true) {
            if (--row < 0) {
                return null;
            }

            prevCell = cell = 0;
            while (cell <= posX) {
                prevCell = cell;
                cell += this.getColspan(row, cell);
            }

            if (this.canCellBeActive(row, prevCell)) {
                return {
                    row: row,
                    cell: prevCell,
                    posX: posX
                };
            }
        }
    }

    private gotoNext(row?: number, cell?: number, posX?: number): GoToResult {
        if (row == null && cell == null) {
            row = cell = posX = 0;
            if (this.canCellBeActive(row, cell)) {
                return {
                    row: row,
                    cell: cell,
                    posX: cell
                };
            }
        }

        var pos = this.gotoRight(row, cell, posX);
        if (pos) {
            return pos;
        }

        var firstFocusableCell = null;
        var dataLengthIncludingAddNew = this.getDataLengthIncludingAddNew();
        while (++row < dataLengthIncludingAddNew) {
            firstFocusableCell = this.findFirstFocusableCell(row);
            if (firstFocusableCell != null) {
                return {
                    row: row,
                    cell: firstFocusableCell,
                    posX: firstFocusableCell
                };
            }
        }
        return null;
    }

    private gotoPrev(row?: number, cell?: number, posX?: number): { row: number; cell: number; posX: number; } {
        var cols = this._cols;
        if (row == null && cell == null) {
            row = this.getDataLengthIncludingAddNew() - 1;
            cell = posX = cols.length - 1;
            if (this.canCellBeActive(row, cell)) {
                return {
                    row: row,
                    cell: cell,
                    posX: cell
                };
            }
        }

        var pos;
        var lastSelectableCell;
        while (!pos) {
            pos = this.gotoLeft(row, cell, posX);
            if (pos) {
                break;
            }
            if (--row < 0) {
                return null;
            }

            cell = 0;
            lastSelectableCell = this.findLastFocusableCell(row);
            if (lastSelectableCell != null) {
                pos = {
                    row: row,
                    cell: lastSelectableCell,
                    posX: lastSelectableCell
                };
            }
        }
        return pos;
    }

    private gotoRowStart(row: number) {
        var newCell = this.findFirstFocusableCell(row);
        if (newCell === null)
            return null;

        return {
            row: row,
            cell: newCell,
            posX: newCell
        };
    }

    private gotoRowEnd(row: number) {
        var newCell = this.findLastFocusableCell(row);
        if (newCell === null)
            return null;

        return {
            row: row,
            cell: newCell,
            posX: newCell
        };
    }

    navigateRight(): boolean {
        return this.navigate("right");
    }

    navigateLeft(): boolean {
        return this.navigate("left");
    }

    navigateDown(): boolean {
        return this.navigate("down");
    }

    navigateUp(): boolean {
        return this.navigate("up");
    }

    navigateNext(): boolean {
        return this.navigate("next");
    }

    navigatePrev(): boolean {
        return this.navigate("prev");
    }

    navigateRowStart(): boolean {
        return this.navigate("home");
    }

    navigateRowEnd(): boolean {
        return this.navigate("end");
    }

    /**
     * @param {string} dir Navigation direction.
     * @return {boolean} Whether navigation resulted in a change of active cell.
     */
    navigate(dir: string): boolean {
        if (!this._options.enableCellNavigation) {
            return false;
        }

        if (!this._activeCellNode && dir != "prev" && dir != "next") {
            return false;
        }

        if (!this.getEditorLock().commitCurrentEdit()) {
            return true;
        }
        this.setFocus();

        var tabbingDirections = {
            up: -1,
            down: 1,
            prev: -1,
            next: 1,
            home: -1,
            end: 1
        };

        tabbingDirections[this._rtlS] = -1;
        tabbingDirections[this._rtlE] = 1;

        this._tabbingDirection = tabbingDirections[dir];

        var stepFunctions = {
            up: this.gotoUp,
            down: this.gotoDown,
            prev: this.gotoPrev,
            next: this.gotoNext,
            home: this.gotoRowStart,
            end: this.gotoRowEnd
        };

        stepFunctions[this._rtlS] = this.gotoLeft;
        stepFunctions[this._rtlE] = this.gotoRight;

        var stepFn = stepFunctions[dir].bind(this);
        var pos = stepFn(this._activeRow, this._activeCell, this._activePosX);
        if (pos) {
            if (this.hasFrozenRows() && this._options.frozenBottom && pos.row == this.getDataLength()) {
                return;
            }

            var isAddNewRow = (pos.row == this.getDataLength());

            if ((!this._options.frozenBottom && pos.row >= this._actualFrozenRow)
                || (this._options.frozenBottom && pos.row < this._actualFrozenRow)
            ) {
                this.scrollCellIntoView(pos.row, pos.cell, !isAddNewRow);
            }

            this.setActiveCellInternal(this.getCellNode(pos.row, pos.cell))
            this._activePosX = pos.posX;
            return true;
        } else {
            this.setActiveCellInternal(this.getCellNode(this._activeRow, this._activeCell));
            return false;
        }
    }

    getCellNode(row: number, cell: number): HTMLElement {
        if (this._rowsCache[row]) {
            this.ensureCellNodesInRowsCache(row);
            return this._rowsCache[row].cellNodesByColumnIdx[cell];
        }
        return null;
    }

    setActiveCell(row: number, cell: number) {
        if (!this._initialized) { return; }
        var cols = this._cols;
        if (row > this.getDataLength() || row < 0 || cell >= cols.length || cell < 0) {
            return;
        }

        if (!this._options.enableCellNavigation) {
            return;
        }

        this.scrollCellIntoView(row, cell, false);
        this.setActiveCellInternal(this.getCellNode(row, cell), false);
    }

    setActiveRow(row: number, cell: number, suppressScrollIntoView?: boolean) {
        if (!this._initialized)
            return;

        if (row > this.getDataLength() || row < 0 || cell >= this._cols.length || cell < 0)
            return;

        this._activeRow = row;
        if (!suppressScrollIntoView)
            this.scrollCellIntoView(row, cell || 0, false);
    }

    private canCellBeActive(row: number, cell: number): boolean {
        var cols = this._cols;
        if (!this._options.enableCellNavigation || row >= this.getDataLengthIncludingAddNew() ||
            row < 0 || cell >= cols.length || cell < 0) {
            return false;
        }

        var rowMetadata = this._data.getItemMetadata && this._data.getItemMetadata(row);
        if (rowMetadata && typeof rowMetadata.focusable === "boolean") {
            return rowMetadata.focusable;
        }

        var colsMetadata = rowMetadata && rowMetadata.columns;
        if (colsMetadata && cols[cell] && colsMetadata[cols[cell].id] && typeof colsMetadata[cols[cell].id].focusable === "boolean") {
            return colsMetadata[cols[cell].id].focusable;
        }
        if (colsMetadata && colsMetadata[cell] && typeof colsMetadata[cell].focusable === "boolean") {
            return colsMetadata[cell].focusable;
        }

        return cols[cell].focusable;
    }

    canCellBeSelected(row: number, cell: number) {
        var cols = this._cols;
        if (row >= this.getDataLength() || row < 0 || cell >= cols.length || cell < 0) {
            return false;
        }

        var itemMetadata = this._data.getItemMetadata && this._data.getItemMetadata(row);
        if (itemMetadata && typeof itemMetadata.selectable === "boolean") {
            return itemMetadata.selectable;
        }

        var columnMetadata = itemMetadata && itemMetadata.columns && (itemMetadata.columns[cols[cell].id] || itemMetadata.columns[cell]);
        if (columnMetadata && typeof columnMetadata.selectable === "boolean") {
            return columnMetadata.selectable;
        }

        return cols[cell].selectable;
    }

    gotoCell(row: number, cell: number, forceEdit?: boolean) {
        if (!this._initialized) { return; }
        if (!this.canCellBeActive(row, cell)) {
            return;
        }

        if (!this.getEditorLock().commitCurrentEdit()) {
            return;
        }

        this.scrollCellIntoView(row, cell, false);

        var newCell = this.getCellNode(row, cell);

        // if selecting the 'add new' row, start editing right away
        this.setActiveCellInternal(newCell, forceEdit || (row === this.getDataLength()) || this._options.autoEdit);

        // if no editor was created, set the focus back on the grid
        if (!this._currentEditor) {
            this.setFocus();
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // IEditor implementation for the editor lock

    commitCurrentEdit(): boolean {
        var item = this.getDataItem(this._activeRow);
        var column = this._cols[this._activeCell];
        var self = this;

        if (this._currentEditor) {
            if (this._currentEditor.isValueChanged()) {
                var validationResults = this._currentEditor.validate();

                if (validationResults.valid) {
                    if (this._activeRow < this.getDataLength()) {
                        var editCommand: EditCommand = {
                            row: this._activeRow,
                            cell: self._activeCell,
                            editor: this._currentEditor,
                            serializedValue: this._currentEditor.serializeValue(),
                            prevSerializedValue: this._serializedEditorValue,
                            execute: function () {
                                this.editor.applyValue(item, this.serializedValue);
                                self.updateRow(this.row);
                                self.trigger(self.onCellChange, {
                                    row: this.activeRow,
                                    cell: self._activeCell,
                                    item: item
                                });
                            },
                            undo: function () {
                                this.editor.applyValue(item, this.prevSerializedValue);
                                self.updateRow(this.row);
                                self.trigger(self.onCellChange, {
                                    row: this.activeRow,
                                    cell: self._activeCell,
                                    item: item
                                });
                            }
                        };

                        if (this._options.editCommandHandler) {
                            this.makeActiveCellNormal();
                            this._options.editCommandHandler(item, column, editCommand);
                        } else {
                            editCommand.execute();
                            this.makeActiveCellNormal();
                        }

                    } else {
                        var newItem = {} as TItem;
                        this._currentEditor.applyValue(newItem, this._currentEditor.serializeValue());
                        this.makeActiveCellNormal();
                        this.trigger(this.onAddNewRow, { item: newItem, column: column });
                    }

                    // check whether the lock has been re-acquired by event handlers
                    return !this.getEditorLock().isActive();
                } else {
                    // Re-add the CSS class to trigger transitions, if any.
                    this._activeCellNode.classList.remove("invalid");
                    this._activeCellNode.offsetWidth;  // force layout
                    this._activeCellNode.classList.add("invalid");

                    this.trigger(this.onValidationError, {
                        editor: this._currentEditor,
                        cellNode: this._activeCellNode,
                        validationResults: validationResults,
                        row: this._activeRow,
                        cell: this._activeCell,
                        column: column
                    });

                    this._currentEditor.focus();
                    return false;
                }
            }

            this.makeActiveCellNormal();
        }
        return true;
    }

    private cancelCurrentEdit() {
        this.makeActiveCellNormal();
        return true;
    }

    private rowsToRanges(rows: number[]): Range[] {
        var ranges = [];
        var lastCell = this._cols.length - 1;
        for (var i = 0; i < rows.length; i++) {
            ranges.push(new Range(rows[i], 0, rows[i], lastCell));
        }
        return ranges;
    }

    getSelectedRows(): number[] {
        if (!this._selectionModel) {
            throw "Selection model is not set";
        }
        return this._selectedRows;
    }

    setSelectedRows(rows: number[]) {
        if (!this._selectionModel) {
            throw "Selection model is not set";
        }
        this._selectionModel.setSelectedRanges(this.rowsToRanges(rows));
    }

    private frozenLayout(): Layout {
        var _canvasWidthL: number;
        var _canvasWidthR: number;
        var _headersWidthL: number;
        var _headersWidthR: number;
        var _paneBottomH: number = 0;
        var _paneTopH: number = 0;

        var _canvasBottomL: HTMLDivElement;
        var _canvasBottomR: HTMLDivElement;
        var _canvasTopL: HTMLDivElement;
        var _canvasTopR: HTMLDivElement;
        var _headerColsL: HTMLDivElement;
        var _headerColsR: HTMLDivElement;
        var _headerRowColsL: HTMLDivElement;
        var _headerRowColsR: HTMLDivElement;
        var _headerRowSpacerL: HTMLDivElement;
        var _headerRowSpacerR: HTMLDivElement;
        var _footerRowColsL: HTMLDivElement;
        var _footerRowColsR: HTMLDivElement;
        var _footerRowSpacerL: HTMLDivElement;
        var _footerRowSpacerR: HTMLDivElement;
        var _paneBottomL: HTMLDivElement;
        var _paneBottomR: HTMLDivElement;
        var _paneHeaderL: HTMLDivElement;
        var _paneHeaderR: HTMLDivElement;
        var _paneTopL: HTMLDivElement;
        var _paneTopR: HTMLDivElement;
        var _topPanelL: HTMLDivElement;
        var _topPanelR: HTMLDivElement;
        var _viewportBottomL: HTMLDivElement;
        var _viewportBottomR: HTMLDivElement;
        var _viewportTopL: HTMLDivElement;
        var _viewportTopR: HTMLDivElement;

        const calcCanvasWidth = () => {
            var cols = this._cols, i = cols.length, frozenCols = this._frozenCols;

            _canvasWidthL = _canvasWidthR = 0;

            while (i--) {
                if (frozenCols > 0 && i >= frozenCols) {
                    _canvasWidthR += cols[i].width;
                } else {
                    _canvasWidthL += cols[i].width;
                }
            }

            var totalRowWidth = _canvasWidthL + _canvasWidthR;
            return this._options.fullWidthRows ? Math.max(totalRowWidth, this.getAvailableWidth()) : totalRowWidth;
        }

        const spacerW = calcCanvasWidth() + this._scrollDims.width + 'px';
        const uisd = this._uisd;
        var options = this._options;

        // -- PANE HEADER LEFT
        _headerColsL = H('div', { class: 'slick-header-columns slick-header-columns-left', style: this._rtlS + ':-1000px' });
        _paneHeaderL = H('div', { class: "slick-pane slick-pane-header slick-pane-left", tabIndex: '0' },
            H('div', { class: 'slick-header slick-header-left' + uisd, style: !this._options.showColumnHeader && 'display: none' }, _headerColsL));

        // -- PANE HEADER RIGHT
        _headerColsR = H('div', { class: 'slick-header-columns slick-header-columns-right', style: this._rtlS + ':-1000px' });
        _paneHeaderR = H('div', { class: "slick-pane slick-pane-header slick-pane-right", tabIndex: '0' },
            H('div', { class: 'slick-header slick-header-right' + uisd, style: !this._options.showColumnHeader && 'display: none' }, _headerColsR));

        // -- PANE TOP LEFT (headerrow left + top panel left + viewport top left + footer row right)
        _headerRowColsL = H('div', { class: 'slick-headerrow-columns slick-headerrow-columns-left' });
        _headerRowSpacerL = spacerDiv(spacerW);
        var headerRowL = H('div', { class: 'slick-headerrow' + uisd, style: !options.showHeaderRow && 'display: none' }, _headerRowColsL, _headerRowSpacerL);

        _topPanelL = H('div', { class: 'slick-top-panel', style: 'width: 10000px' })
        var topPanelLS = H('div', { class: 'slick-top-panel-scroller' + uisd, style: !options.showTopPanel && 'display: none' }, _topPanelL);

        _canvasTopL = H('div', { class: "grid-canvas grid-canvas-top grid-canvas-left", tabIndex: "0", hideFocus: '' });
        _viewportTopL = H('div', { class: "slick-viewport slick-viewport-top slick-viewport-left", tabIndex: "0", hideFocus: '' }, _canvasTopL);

        _footerRowColsL = H('div', { class: 'slick-footerrow-columns slick-footerrow-columns-left' });
        _footerRowSpacerL = spacerDiv(spacerW);
        var footerRowL = H('div', { class: 'slick-footerrow' + uisd, style: !options.showFooterRow && 'display: none' }, _footerRowColsL, _footerRowSpacerL);

        _paneTopL = H('div', { class: "slick-pane slick-pane-top slick-pane-left", tabIndex: "0" }, headerRowL, topPanelLS, _viewportTopL, footerRowL);

        // -- PANE TOP RIGHT (headerrow right + top panel right + viewport top right + footer row right)
        _headerRowColsR = H('div', { class: 'slick-headerrow-columns slick-headerrow-columns-right' });
        _headerRowSpacerR = spacerDiv(spacerW);
        var headerRowR = H('div', { class: 'slick-headerrow' + uisd, style: !options.showHeaderRow && 'display: none' }, _headerRowColsR, _headerRowSpacerR);

        _topPanelR = H('div', { class: 'slick-top-panel', style: 'width: 10000px' });
        var topPanelRS = H('div', { class: 'slick-top-panel-scroller' + uisd, style: !options.showTopPanel && 'display: none' }, _topPanelR);

        _canvasTopR = H('div', { class: "grid-canvas grid-canvas-top grid-canvas-right", tabIndex: "0", hideFocus: '' })
        _viewportTopR = H('div', { class: "slick-viewport slick-viewport-top slick-viewport-right", tabIndex: "0", hideFocus: '' }, _canvasTopR);

        _footerRowColsR = H('div', { class: 'slick-footerrow-columns slick-footerrow-columns-right' });
        _footerRowSpacerR = H('div', { style: 'display:block;height:1px;position:absolute;top:0;left:0;', width: spacerW });
        var footerRowR = H('div', { class: 'slick-footer-row' + uisd, style: !options.showFooterRow && 'display: none' }, _footerRowColsR, _footerRowSpacerR);

        _paneTopR = H('div', { class: "slick-pane slick-pane-top slick-pane-right", tabIndex: "0" }, headerRowR, topPanelRS, _viewportTopR, footerRowR);

        // -- PANE BOTTOM LEFT
        _canvasBottomL = H('div', { class: "grid-canvas grid-canvas-bottom grid-canvas-left", tabIndex: "0", hideFocus: '' });
        _viewportBottomL = H('div', { class: "slick-viewport slick-viewport-bottom slick-viewport-left", tabIndex: "0", hideFocus: '' }, _canvasBottomL);
        _paneBottomL = H('div', { class: "slick-pane slick-pane-bottom slick-pane-left", tabIndex: "0" }, _viewportBottomL);

        _canvasBottomR = H('div', { class: "grid-canvas grid-canvas-bottom grid-canvas-right", tabIndex: "0", hideFocus: '' });
        _viewportBottomR = H('div', { class: "slick-viewport slick-viewport-bottom slick-viewport-right", tabIndex: "0", hideFocus: '' });
        _paneBottomR = H('div', { class: "slick-pane slick-pane-bottom slick-pane-right", tabIndex: "0" }, _viewportBottomR);

        // disable all text selection in header (including input and textarea)
        disableSelection(_headerColsL);
        disableSelection(_headerColsR);

        function getHeaderCols() {
            return [_headerColsL, _headerColsR];
        }

        function getHeaderRowCols() {
            return [_headerRowColsL, _headerRowColsR];
        }

        function getFooterRowCols() {
            return [_footerRowColsL, _footerRowColsR];
        }

        const getCanvasNodeFor = (row: number, cell: number) => {
            if (row == null && cell == null)
                return _canvasTopL;

            var rightSide = cell >= this._frozenCols;

            if (this._frozenRows > 0 && (row >= this._actualFrozenRow + (this._options.frozenBottom ? 0 : 1)))
                return rightSide ? _canvasBottomR : _canvasBottomL;

            return rightSide ? _canvasTopR : _canvasTopL;
        }

        const getCanvasWidthFor = (cell: number) => {
            return cell >= this._frozenCols ? _canvasWidthR : _canvasWidthL;
        }

        function getCanvasNodes() {
            return [_canvasTopL, _canvasTopR, _canvasBottomL, _canvasBottomR];
        }

        function getViewportNodeFor(row: number, cell: number) {
            if (row == null && cell == null)
                return _canvasTopL;

            var rightSide = cell >= this._frozenCols;

            if (this._frozenRows > 0 && (row >= this._actualFrozenRow + (this._options.frozenBottom ? 0 : 1)))
                return rightSide ? _canvasBottomR : _canvasBottomL;

            return rightSide ? _canvasTopR : _canvasTopL;
        }

        function getViewportNodes() {
            return [_viewportTopL, _viewportTopR, _viewportBottomL, _viewportBottomR];
        }

        const updateCanvasWidth = () => {
            var oldCanvasWidth = this._canvasWidth;
            var oldCanvasWidthL = _canvasWidthL;
            var oldCanvasWidthR = _canvasWidthR;
            var widthChanged;
            this._canvasWidth = this.getCanvasWidth();
            var scrollWidth = this._scrollDims.width;

            widthChanged = this._canvasWidth !== oldCanvasWidth || _canvasWidthL !== oldCanvasWidthL || _canvasWidthR !== oldCanvasWidthR;

            if (widthChanged || this.hasFrozenColumns() || this.hasFrozenRows()) {
                var canvasWidthL = _canvasWidthL + 'px'
                var canvasWidthR = _canvasWidthR + 'px';

                _canvasTopL.style.width = canvasWidthL;

                calcHeaderWidths();

                if (this._groupingPanel) {
                    this._groupingPanel.style.width = this._canvasWidth + 'px';
                }

                if (this.hasFrozenColumns()) {
                    var viewportMinus = (this._viewportW - _canvasWidthL) + 'px';

                    _canvasTopR.style.width = canvasWidthR;
                    _paneHeaderL.style.width = canvasWidthL;
                    _paneHeaderR.style[this._rtlS] = canvasWidthL;
                    _paneHeaderR.style.width = viewportMinus;

                    _paneTopL.style.width = canvasWidthL;
                    _paneTopR.style[this._rtlS] = canvasWidthL;
                    _paneTopR.style.width = viewportMinus;

                    _headerRowColsL.style.width = canvasWidthL;
                    _headerRowColsL.parentElement.style.width = canvasWidthL;
                    _headerRowColsR.style.width = canvasWidthR;
                    _headerRowColsR.parentElement.style.width = viewportMinus;

                    _footerRowColsL.style.width = canvasWidthL;
                    _footerRowColsL.parentElement.style.width = canvasWidthL;
                    _footerRowColsR.style.width = canvasWidthR;
                    _footerRowColsR.parentElement.style.width = viewportMinus;

                    _viewportTopL.style.width = canvasWidthL;
                    _viewportTopR.style.width = viewportMinus;

                    if (this.hasFrozenRows()) {
                        _paneBottomL.style.width = canvasWidthL;
                        _paneBottomR.style[this._rtlS] = canvasWidthL;

                        _viewportBottomL.style.width = canvasWidthL;
                        _viewportBottomR.style.width = viewportMinus;

                        _canvasBottomL.style.width = canvasWidthL;
                        _canvasBottomR.style.width = canvasWidthR;
                    }
                } else {
                    _paneHeaderL.style.width = '100%';
                    _paneTopL.style.width = '100%';
                    _headerRowColsL.parentElement.style.width = '100%';
                    _headerRowColsL.style.width = this._canvasWidth + 'px';
                    _footerRowColsL.parentElement.style.width = '100%';
                    _footerRowColsL.style.width = this._canvasWidth + 'px';
                    _viewportTopL.style.width = '100%';

                    if (this.hasFrozenRows()) {
                        _viewportBottomL.style.width = '100%';
                        _canvasBottomL.style.width = canvasWidthL;
                    }
                }

                this._viewportHasHScroll = (this._canvasWidth > this._viewportW - scrollWidth);
            }

            var w = (this._canvasWidth + (this._viewportHasVScroll ? scrollWidth : 0)) + 'px';

            _headerRowSpacerL.style.width = w;
            _headerRowSpacerR.style.width = w;
            _footerRowSpacerL.style.width = w;
            _footerRowSpacerR.style.width = w;

            return widthChanged;
        }

        const getHeaderColumn = (cell: number) => {
            return (this._frozenCols > 0 && cell >= this._frozenCols ?
                _headerColsR.children.item(cell - this._frozenCols) : _headerColsL.children.item(cell)) as HTMLDivElement;
        }

        const getHeaderRowColumn = (cell: number) => {
            var target: HTMLDivElement, frozenCols = this._frozenCols;

            if (frozenCols <= 0 || cell < frozenCols) {
                target = _headerRowColsL;
            }
            else {
                target = _headerRowColsR;
                cell -= frozenCols;
            }

            return target.childNodes.item(cell) as HTMLDivElement;
        }

        const getFooterRowColumn = (cell: number) => {
            var target: HTMLDivElement, frozenCols = this._frozenCols;

            if (frozenCols <= 0 || cell < frozenCols) {
                target = _footerRowColsL;
            }
            else {
                target = _footerRowColsR;
                cell -= frozenCols;
            }

            return target.childNodes.item(cell) as HTMLDivElement;
        }

        const getHeaderRowColsFor = (cell: number) => {
            const frozenCols = this._frozenCols;
            return frozenCols > 0 && cell >= frozenCols ? _headerRowColsR : _headerRowColsL;
        }

        const getFooterRowColsFor = (cell: number) => {
            const frozenCols = this._frozenCols;
            return frozenCols > 0 && cell >= frozenCols ? _footerRowColsR : _footerRowColsL;
        }

        const calcHeaderWidths = () => {
            _headersWidthL = _headersWidthR = 0;

            var scrollWidth = this._scrollDims.width;
            var cols = this._cols, frozenCols = this._frozenCols;
            for (var i = 0, ii = cols.length; i < ii; i++) {
                var width = cols[i].width;

                if (frozenCols > 0 && i >= frozenCols) {
                    _headersWidthR += width;
                } else {
                    _headersWidthL += width;
                }
            }

            if (frozenCols > 0) {
                _headersWidthL = _headersWidthL + 1000;

                _headersWidthR = Math.max(_headersWidthR, this._viewportW) + _headersWidthL;
                _headersWidthR += scrollWidth;
            } else {
                _headersWidthL += scrollWidth;
                _headersWidthL = Math.max(_headersWidthL, this._viewportW) + 1000;
            }

            _headerColsL.style.width = _headersWidthL + 'px';
            _headerColsR.style.width = _headersWidthR + 'px';
        }

        const getHeaderColsFor = (cell: number) => {
            const frozenCols = this._frozenCols;
            return frozenCols > 0 && cell >= frozenCols ? _headerColsR : _headerColsL;
        }

        const handleScrollH = () => {
            if (this.hasFrozenColumns()) {
                _headerColsR.parentElement.scrollLeft = this._scrollLeft;
                _topPanelR.parentElement.scrollLeft = this._scrollLeft;
                _headerRowColsR.parentElement.scrollLeft = this._scrollLeft;
                _footerRowColsR.parentElement.scrollLeft = this._scrollLeft;
                if (this.hasFrozenRows()) {
                    _viewportTopR.scrollLeft = this._scrollLeft;
                }
            } else {
                _headerColsL.parentElement.scrollLeft = this._scrollLeft;
                _topPanelL.parentElement.scrollLeft = this._scrollLeft;
                _headerRowColsL.parentElement.scrollLeft = this._scrollLeft;
                _footerRowColsL.parentElement.scrollLeft = this._scrollLeft;
                if (this.hasFrozenRows()) {
                    _viewportTopL.scrollLeft = this._scrollLeft;
                }
            }
        }

        const handleScrollV = () => {
            if (this.hasFrozenColumns()) {
                if (this.hasFrozenRows() && !this._options.frozenBottom) {
                    _viewportBottomL.scrollTop = this._scrollTop;
                } else {
                    _viewportTopL.scrollTop = this._scrollTop;
                }
            }
        }

        const setScroller = () => {
            if (this.hasFrozenColumns()) {
                if (this.hasFrozenRows()) {
                    if (this._options.frozenBottom) {
                        this._scrollContainerX = _viewportBottomR;
                        this._scrollContainerY = _viewportTopR;
                    } else {
                        this._scrollContainerX = this._scrollContainerY = _viewportBottomR;
                    }
                } else {
                    this._scrollContainerX = this._scrollContainerY = _viewportTopR;
                }
            } else {
                if (this.hasFrozenRows()) {
                    if (this._options.frozenBottom) {
                        this._scrollContainerX = _viewportBottomL;
                        this._scrollContainerY = _viewportTopL;
                    } else {
                        this._scrollContainerX = this._scrollContainerY = _viewportBottomL;
                    }
                } else {
                    this._scrollContainerX = this._scrollContainerY = _viewportTopL;
                }
            }
        }

        const setPaneVisibility = () => {
            _paneHeaderR.style.display = _paneTopR.style.display = this.hasFrozenColumns() ? '' : 'none';
            _paneBottomL.style.display = this.hasFrozenRows() ? '' : 'none';
            _paneBottomR.style.display = this.hasFrozenRows() && this.hasFrozenColumns() ? '' : 'none';
        }

        const setOverflow = () => {
            var frozenRows = this.hasFrozenRows();
            var frozenCols = this.hasFrozenColumns();
            var alwaysHS = this._options.alwaysAllowHorizontalScroll;
            var alwaysVS = this._options.alwaysShowVerticalScroll;

            _viewportTopL.style.overflowX = _viewportTopR.style.overflowX = (frozenRows && !alwaysHS) ? 'hidden' : (frozenCols ? 'scroll' : 'auto');
            _viewportTopL.style.overflowY = _viewportBottomL.style.overflowY = (!frozenCols && alwaysVS) ? 'scroll' :
                (frozenCols ? 'hidden' : (frozenRows ? 'scroll' : (this._options.autoHeight ? 'hidden' : 'auto')));
            _viewportTopR.style.overflowY = (alwaysVS || frozenRows) ? 'scroll' : (this._options.autoHeight ? 'hidden' : 'auto');
            _viewportBottomL.style.overflowX = _viewportBottomR.style.overflowX = (frozenCols && !alwaysHS) ? 'scroll' : 'auto';
            _viewportBottomR.style.overflowY = (alwaysVS) ? 'scroll' : 'auto';
        }

        const bindAncestorScrollEvents = () => {
            var elem: HTMLElement = (this.hasFrozenRows() && !this._options.frozenBottom) ? _canvasBottomL : _canvasTopL;
            while ((elem = elem.parentNode as HTMLElement) != document.body && elem != null) {
                // bind to scroll containers only
                if (elem == _viewportTopL || elem.scrollWidth != elem.clientWidth || elem.scrollHeight != elem.clientHeight) {
                    elem.addEventListener('scroll', this.handleActiveCellPositionChange);
                    this._boundAncestorScroll.push(elem);
                }
            }
        }

        const afterHeaderColumnDrag = () => {
            const oldCanvasWidthL = _canvasWidthL;
            calcCanvasWidth();
            if (this.hasFrozenColumns() &&  _canvasWidthL != oldCanvasWidthL) {
                _headerColsL.style.width = _canvasWidthL + 1000 + 'px';
                _paneHeaderR.style[this._rtlS] = _canvasWidthL + 'px';
            }
        }

        const applyColumnWidths = () => {
            var x = 0, w, rule, cols = this._cols, frozenCols = this._frozenCols;
            for (var i = 0; i < cols.length; i++) {
                if (frozenCols == i)
                    x = 0;
                w = cols[i].width;
                rule = this.getColumnCssRules(i);
                rule[this._rtlS].style[this._rtlS] = x + "px";
                rule[this._rtlE].style[this._rtlE] = (((frozenCols > 0 && i >= frozenCols) ? _canvasWidthR : _canvasWidthL) - x - w) + "px";
                x += w;
            }
        }

        const getTopPanelFor = (cell: number) => {
            return this._frozenCols > 0 && cell >= this._frozenCols ? _topPanelR : _topPanelL;
        }

        const getTopPanelNodes = () => [_topPanelL, _topPanelR];

        const resizeCanvas = () => {
            _paneTopH = 0
            _paneBottomH = 0
            this._viewportTopH = 0

            // Account for Frozen Rows
            if (this.hasFrozenRows()) {
                const frozenRowsHeight = this._frozenRows * this._options.rowHeight;
                if (this._options.frozenBottom) {
                    this._paneTopH = this._viewportH - frozenRowsHeight;
                    this._paneBottomH = frozenRowsHeight + this._scrollDims.height;
                } else {
                    this._paneTopH = frozenRowsHeight;
                    this._paneBottomH = this._viewportH - frozenRowsHeight;
                }
            } else {
                this._paneTopH = this._viewportH;
            }

            // The top pane includes the top panel, the header row and the footer row
            this._paneTopH += this._topPanelH + this._headerRowH + this._footerRowH;

            // The top viewport does not contain the top panel, the header row or the footer row
            this._viewportTopH = this._paneTopH - this._topPanelH - this._headerRowH - this._footerRowH;

            if (this._options.autoHeight) {
                this._container.style.height = (this._paneTopH + this._groupingPanelH +
                    parseFloat(getComputedStyle(this._headerColsL.parentElement).height)) + 'px';
            }

            this._paneTopL.style.top = (this._groupingPanelH + (parseFloat(getComputedStyle(this._paneHeaderL).height) || this._headerRowH)) + "px";
            this._paneTopL.style.height = this._paneTopH + 'px';

            var paneBottomTop = this._paneTopL.offsetTop + this._paneTopH;

            if (this._options.autoHeight) {
                this._viewportTopL.style.height = '';
            }
            else {
                this._viewportTopL.style.height = this._viewportTopH + 'px'
            }

            if (this.hasFrozenColumns()) {
                this._paneTopR.style.top = this._paneTopL.style.top;
                this._paneTopR.style.height = this._paneTopL.style.height;

                this._viewportTopR.style.height = this._viewportTopL.style.height;

                if (this.hasFrozenRows()) {
                    this._paneBottomL.style.top = this._paneBottomR.style.top = paneBottomTop + 'px';
                    this._paneBottomL.style.height = this._paneBottomR.style.height = this._viewportBottomR.style.height = this._paneBottomH + 'px';
                }
            } else {
                if (this.hasFrozenRows()) {
                    this._paneBottomL.style.width = '100%';
                    this._paneBottomL.style.height = this._paneBottomH + 'px';
                    this._paneBottomL.style.top = paneBottomTop + 'px';
                }
            }

            if (this.hasFrozenRows()) {
                this._viewportBottomL.style.height = this._paneBottomH + 'px';
                const frozenRowsHeight = this._frozenRows * this._options.rowHeight;
                if (this._options.frozenBottom) {
                    this._canvasBottomL.style.height = frozenRowsHeight + 'px';

                    if (this.hasFrozenColumns()) {
                        this._canvasBottomR.style.height = frozenRowsHeight + 'px';
                    }
                } else {
                    this._canvasTopL.style.height = frozenRowsHeight + 'px';

                    if (this.hasFrozenColumns()) {
                        this._canvasTopR.style.height = frozenRowsHeight + 'px';
                    }
                }
            } else {
                this._viewportTopR.style.height = this._viewportTopH + 'px';
            }
        }

        return {
            afterHeaderColumnDrag,
            applyColumnWidths,
            bindAncestorScrollEvents,
            calcCanvasWidth,
            calcHeaderWidths,
            getCanvasWidthFor,
            getCanvasNodeFor,
            getCanvasNodes,
            getFooterRowCols,
            getFooterRowColsFor,
            getFooterRowColumn,
            getHeaderCols,
            getHeaderColsFor,
            getHeaderColumn,
            getHeaderRowCols,
            getHeaderRowColsFor,
            getHeaderRowColumn,
            getTopPanelFor,
            getTopPanelNodes,
            getViewportNodeFor,
            getViewportNodes,
            handleScrollH,
            handleScrollV,
            setPaneVisibility,
            setScroller,
            setOverflow,
            updateCanvasWidth,
        }
    }

    private basicLayout(): Layout {
        var _canvasWidthL: number;
        var _headersWidthL: number;

        var _canvasTopL: HTMLDivElement;
        var _headerColsL: HTMLDivElement;
        var _headerRowColsL: HTMLDivElement;
        var _headerRowSpacerL: HTMLDivElement;
        var _footerRowColsL: HTMLDivElement;
        var _footerRowSpacerL: HTMLDivElement;
        var _paneHeaderL: HTMLDivElement;
        var _paneTopL: HTMLDivElement;
        var _topPanelL: HTMLDivElement;
        var _viewportTopL: HTMLDivElement;

        const calcCanvasWidth = () => {
            var cols = this._cols, i = cols.length;

            _canvasWidthL = 0;

            while (i--) {
                _canvasWidthL += cols[i].width;
            }

            return this._options.fullWidthRows ? Math.max(_canvasWidthL, this.getAvailableWidth()) : _canvasWidthL;
        }

        const calcHeaderWidths = () => {
            _headersWidthL = 0;

            var scrollWidth = this._scrollDims.width;
            var cols = this._cols;
            for (var i = 0, ii = cols.length; i < ii; i++) {
                _headersWidthL +=  cols[i].width;
            }

            _headersWidthL += scrollWidth;
            _headersWidthL = Math.max(_headersWidthL, this._viewportW) + 1000;
            _headerColsL.style.width = _headersWidthL + 'px';
        }

        const spacerW = calcCanvasWidth() + this._scrollDims.width + 'px';
        const uisd = this._uisd;
        var options = this._options;

        _headerColsL = H('div', { class: 'slick-header-columns', style: this._rtlS + ':-1000px' });
        _paneHeaderL = H('div', { class: "slick-pane slick-pane-header", tabIndex: '0' },
            H('div', { class: 'slick-header' + uisd, style: !this._options.showColumnHeader && 'display: none' }, _headerColsL));

        _headerRowColsL = H('div', { class: 'slick-headerrow-columns' });
        _headerRowSpacerL = spacerDiv(spacerW);
        var headerRowL = H('div', { class: 'slick-headerrow' + uisd, style: !options.showHeaderRow && 'display: none' }, _headerColsL, _headerRowSpacerL);

        _topPanelL = H('div', { class: 'slick-top-panel', style: 'width: 10000px' })
        var topPanelLS = H('div', { class: 'slick-top-panel-scroller' + uisd, style: !options.showTopPanel && 'display: none' }, _topPanelL);

        _canvasTopL = H('div', { class: "grid-canvas", tabIndex: "0", hideFocus: '' })
        _viewportTopL = H('div', { class: "slick-viewport", tabIndex: "0", hideFocus: '' }, _canvasTopL);

        _footerRowColsL = H('div', { class: 'slick-footerrow-columns' });
        _footerRowSpacerL = spacerDiv(spacerW);
        var footerRowL = H('div', { class: 'slick-footerrow' + uisd, style: !options.showFooterRow && 'display: none' }, _footerRowColsL, _footerRowSpacerL);

        _paneTopL = H('div', { class: "slick-pane", tabIndex: "0" }, headerRowL, topPanelLS, _viewportTopL, footerRowL);

        function getHeaderCols() {
            return [_headerColsL];
        }

        function getHeaderRowCols() {
            return [_headerRowColsL];
        }

        function getHeaderColumn(cell: number) {
            return _headerColsL.children.item(cell) as HTMLDivElement;
        }

        function getFooterRowCols() {
            return [_footerRowColsL];
        }

        function getCanvasNodeFor() {
            return _canvasTopL;
        }

        function getCanvasNodes() {
            return [_canvasTopL];
        }

        function getCanvasWidthFor() {
            return _canvasWidthL;
        }

        function getViewportNodeFor() {
            return _viewportTopL;
        }

        function getViewportNodes() {
            return [_viewportTopL];
        }

        const updateCanvasWidth = () => {
            var oldCanvasWidth = this._canvasWidth;
            var widthChanged;
            this._canvasWidth = this.getCanvasWidth();
            var scrollWidth = this._scrollDims.width;

            widthChanged = this._canvasWidth !== oldCanvasWidth;

            if (widthChanged) {
                var canvasWidthL = this._canvasWidth + 'px'

                _canvasTopL.style.width = canvasWidthL;

                calcHeaderWidths();

                if (this._groupingPanel) {
                    this._groupingPanel.style.width = canvasWidthL;
                }

                _paneHeaderL.style.width = '100%';
                _paneTopL.style.width = '100%';
                _headerRowColsL.parentElement.style.width = '100%';
                _headerRowColsL.style.width = this._canvasWidth + 'px';
                _footerRowColsL.parentElement.style.width = '100%';
                _footerRowColsL.style.width = this._canvasWidth + 'px';
                _viewportTopL.style.width = '100%';

                this._viewportHasHScroll = (this._canvasWidth > this._viewportW - scrollWidth);
            }

            var w = (this._canvasWidth + (this._viewportHasVScroll ? scrollWidth : 0)) + 'px';

            _headerRowSpacerL.style.width = w;
            _footerRowSpacerL.style.width = w;

            return widthChanged;
        }

        function getHeaderRowColumn(cell: number) {
            return _headerRowColsL.childNodes.item(cell) as HTMLDivElement;
        }

        function getFooterRowColumn(cell: number) {
            return _footerRowColsL.childNodes.item(cell) as HTMLDivElement;
        }

        function getHeaderRowColsFor(cell: number) {
            return _headerRowColsL;
        }

        function getFooterRowColsFor(cell: number) {
            return _footerRowColsL;
        }

        function getHeaderColsFor(cell: number) {
            return _headerColsL;
        }

        const handleScrollH = () => {
            _headerColsL.parentElement.scrollLeft = this._scrollLeft;
            _topPanelL.parentElement.scrollLeft = this._scrollLeft;
            _headerRowColsL.parentElement.scrollLeft = this._scrollLeft;
            _footerRowColsL.parentElement.scrollLeft = this._scrollLeft;
        }

        function noop() {
        }

        const setScroller = () => {
            this._scrollContainerX = this._scrollContainerY = _viewportTopL;
        }

        const setOverflow = () => {
            var alwaysVS = this._options.alwaysShowVerticalScroll;

            _viewportTopL.style.overflowX = 'auto';
            _viewportTopL.style.overflowY = alwaysVS ? 'scroll' : (this._options.autoHeight ? 'hidden' : 'auto');
        }

        const bindAncestorScrollEvents = () => {
            var elem: HTMLElement = _canvasTopL;
            while ((elem = elem.parentNode as HTMLElement) != document.body && elem != null) {
                // bind to scroll containers only
                if (elem == _viewportTopL || elem.scrollWidth != elem.clientWidth || elem.scrollHeight != elem.clientHeight) {
                    elem.addEventListener('scroll', this.handleActiveCellPositionChange);
                    this._boundAncestorScroll.push(elem);
                }
            }
        }

        const applyColumnWidths = () => {
            var x = 0, w, rule, cols = this._cols;
            for (var i = 0; i < cols.length; i++) {
                w = cols[i].width;
                rule = this.getColumnCssRules(i);
                rule[this._rtlS].style[this._rtlS] = x + "px";
                rule[this._rtlE].style[this._rtlE] = _canvasWidthL - x - w + "px";
                x += w;
            }
        }

        const getTopPanelNodes = () => [_topPanelL];
        const getTopPanelFor = () => _topPanelL;

        return {
            afterHeaderColumnDrag: noop,
            applyColumnWidths,
            bindAncestorScrollEvents,
            calcCanvasWidth,
            calcHeaderWidths,
            getCanvasNodeFor,
            getCanvasNodes,
            getCanvasWidthFor,
            getHeaderCols,
            getHeaderColsFor,
            getHeaderColumn,
            getHeaderRowCols,
            getHeaderRowColsFor,
            getHeaderRowColumn,
            getFooterRowCols,
            getFooterRowColsFor,
            getFooterRowColumn,
            getTopPanelFor,
            getTopPanelNodes,
            getViewportNodeFor,
            getViewportNodes,
            handleScrollH,
            handleScrollV: noop,
            setPaneVisibility: noop,
            setScroller,
            setOverflow,
            updateCanvasWidth
        }
    }
}
