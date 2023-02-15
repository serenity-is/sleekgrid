/// <reference types="jquery" />

/***
 * A base class that all special / non-data rows (like Group and GroupTotals) derive from.
 */
export declare class NonDataRow {
	__nonDataRow: boolean;
}
export declare const preClickClassName = "slick-edit-preclick";
export interface FormatterContext<TItem = any> {
	addAttrs?: {
		[key: string]: string;
	};
	addClass?: string;
	cell?: number;
	column?: Column<TItem>;
	/** returns html escaped ctx.value if called without arguments. prefer this over ctx.value to avoid html injection attacks! */
	readonly escape: ((value?: any) => string);
	grid?: any;
	item?: TItem;
	row?: number;
	tooltip?: string;
	/** when returning a formatter result, prefer ctx.escape() to avoid html injection attacks! */
	value?: any;
}
export type ColumnFormat<TItem = any> = (ctx: FormatterContext<TItem>) => string;
export interface CompatFormatterResult {
	addClasses?: string;
	text?: string;
	toolTip?: string;
}
export type CompatFormatter<TItem = any> = (row: number, cell: number, value: any, column: Column<TItem>, item: TItem, grid?: any) => string | CompatFormatterResult;
export interface FormatterFactory<TItem = any> {
	getFormat?(column: Column<TItem>): ColumnFormat<TItem>;
	getFormatter?(column: Column<TItem>): CompatFormatter<TItem>;
}
export type AsyncPostRender<TItem = any> = (cellNode: HTMLElement, row: number, item: TItem, column: Column<TItem>, reRender: boolean) => void;
export type AsyncPostCleanup<TItem = any> = (cellNode: HTMLElement, row?: number, column?: Column<TItem>) => void;
export type CellStylesHash = {
	[row: number]: {
		[columnId: string]: string;
	};
};
export declare function defaultColumnFormat(ctx: FormatterContext): any;
export declare function convertCompatFormatter(compatFormatter: CompatFormatter): ColumnFormat;
export declare function applyFormatterResultToCellNode(ctx: FormatterContext, html: string, node: HTMLElement): void;
/***
 * Information about a group of rows.
 */
export declare class Group<TEntity = any> extends NonDataRow {
	readonly __group = true;
	/**
	 * Grouping level, starting with 0.
	 * @property level
	 * @type {Number}
	 */
	level: number;
	/***
	 * Number of rows in the group.
	 * @property count
	 * @type {Number}
	 */
	count: number;
	/***
	 * Grouping value.
	 * @property value
	 * @type {Object}
	 */
	value: any;
	/***
	 * Formatted display value of the group.
	 * @property title
	 * @type {String}
	 */
	title: string;
	/***
	 * Whether a group is collapsed.
	 * @property collapsed
	 * @type {Boolean}
	 */
	collapsed: boolean;
	/***
	 * GroupTotals, if any.
	 * @property totals
	 * @type {GroupTotals}
	 */
	totals: GroupTotals<TEntity>;
	/**
	 * Rows that are part of the group.
	 * @property rows
	 * @type {Array}
	 */
	rows: TEntity[];
	/**
	 * Sub-groups that are part of the group.
	 * @property groups
	 * @type {Array}
	 */
	groups: Group<TEntity>[];
	/**
	 * A unique key used to identify the group.  This key can be used in calls to DataView
	 * collapseGroup() or expandGroup().
	 * @property groupingKey
	 * @type {Object}
	 */
	groupingKey: string;
	/***
	 * Compares two Group instances.
	 * @method equals
	 * @return {Boolean}
	 * @param group {Group} Group instance to compare to.
	 */
	equals(group: Group): boolean;
}
/***
 * Information about group totals.
 * An instance of GroupTotals will be created for each totals row and passed to the aggregators
 * so that they can store arbitrary data in it.  That data can later be accessed by group totals
 * formatters during the display.
 * @class GroupTotals
 * @extends NonDataRow
 * @constructor
 */
export declare class GroupTotals<TEntity = any> extends NonDataRow {
	readonly __groupTotals = true;
	/***
	 * Parent Group.
	 * @param group
	 * @type {Group}
	 */
	group: Group<TEntity>;
	/***
	 * Whether the totals have been fully initialized / calculated.
	 * Will be set to false for lazy-calculated group totals.
	 * @param initialized
	 * @type {Boolean}
	 */
	initialized: boolean;
	/**
	 * Contains sum
	 */
	sum?: number;
	/**
	 * Contains avg
	 */
	avg?: number;
	/**
	 * Contains min
	 */
	min?: any;
	/**
	 * Contains max
	 */
	max?: any;
}
export type EventListener<TArgs, TEventData extends IEventData = IEventData> = (e: TEventData, args: TArgs) => void;
export interface IEventData {
	readonly type?: string;
	currentTarget?: EventTarget | null;
	target?: EventTarget | null;
	originalEvent?: any;
	defaultPrevented?: boolean;
	preventDefault?(): void;
	stopPropagation?(): void;
	stopImmediatePropagation?(): void;
	isDefaultPrevented?(): boolean;
	isImmediatePropagationStopped?(): boolean;
	isPropagationStopped?(): boolean;
}
/***
 * An event object for passing data to event handlers and letting them control propagation.
 * <p>This is pretty much identical to how W3C and jQuery implement events.</p>
 */
export declare class EventData implements IEventData {
	private _isPropagationStopped;
	private _isImmediatePropagationStopped;
	/***
	 * Stops event from propagating up the DOM tree.
	 * @method stopPropagation
	 */
	stopPropagation(): void;
	/***
	 * Returns whether stopPropagation was called on this event object.
	 */
	isPropagationStopped(): boolean;
	/***
	 * Prevents the rest of the handlers from being executed.
	 */
	stopImmediatePropagation(): void;
	/***
	 * Returns whether stopImmediatePropagation was called on this event object.\
	 */
	isImmediatePropagationStopped(): boolean;
}
/***
 * A simple publisher-subscriber implementation.
 */
export declare class EventEmitter<TArgs = any, TEventData extends IEventData = IEventData> {
	private _handlers;
	/***
	 * Adds an event handler to be called when the event is fired.
	 * <p>Event handler will receive two arguments - an <code>EventData</code> and the <code>data</code>
	 * object the event was fired with.<p>
	 * @method subscribe
	 * @param fn {Function} Event handler.
	 */
	subscribe(fn: EventListener<TArgs, TEventData>): void;
	/***
	 * Removes an event handler added with <code>subscribe(fn)</code>.
	 * @method unsubscribe
	 * @param fn {Function} Event handler to be removed.
	 */
	unsubscribe(fn: EventListener<TArgs, TEventData>): void;
	/***
	 * Fires an event notifying all subscribers.
	 * @param args {Object} Additional data object to be passed to all handlers.
	 * @param e {EventData}
	 *      Optional.
	 *      An <code>EventData</code> object to be passed to all handlers.
	 *      For DOM events, an existing W3C/jQuery event object can be passed in.
	 * @param scope {Object}
	 *      Optional.
	 *      The scope ("this") within which the handler will be executed.
	 *      If not specified, the scope will be set to the <code>Event</code> instance.
	 */
	notify(args?: any, e?: TEventData, scope?: object): any;
	clear(): void;
}
export declare class EventSubscriber<TArgs = any, TEventData extends IEventData = IEventData> {
	private _handlers;
	subscribe(event: EventEmitter<TArgs, TEventData>, handler: EventListener<TArgs, TEventData>): this;
	unsubscribe(event: EventEmitter<TArgs, TEventData>, handler: EventListener<TArgs, TEventData>): this;
	unsubscribeAll(): EventSubscriber<TArgs, TEventData>;
}
/** @deprecated */
export declare const keyCode: {
	BACKSPACE: number;
	DELETE: number;
	DOWN: number;
	END: number;
	ENTER: number;
	ESCAPE: number;
	HOME: number;
	INSERT: number;
	LEFT: number;
	PAGEDOWN: number;
	PAGEUP: number;
	RIGHT: number;
	TAB: number;
	UP: number;
};
export declare function patchEvent(e: IEventData): IEventData;
export interface Position {
	bottom?: number;
	height?: number;
	left?: number;
	right?: number;
	top?: number;
	visible?: boolean;
	width?: number;
}
export interface ValidationResult {
	valid: boolean;
	msg?: string;
}
export interface RowCell {
	row: number;
	cell: number;
}
export interface EditorHost {
	getActiveCell(): RowCell;
	navigateNext(): boolean;
	navigatePrev(): boolean;
	onCompositeEditorChange: EventEmitter<any>;
}
export interface CompositeEditorOptions {
	formValues: any;
}
export interface EditorOptions {
	grid: EditorHost;
	gridPosition?: Position;
	position?: Position;
	editorCellNavOnLRKeys?: boolean;
	column?: Column;
	columnMetaData?: ColumnMetadata<any>;
	compositeEditorOptions?: CompositeEditorOptions;
	container?: HTMLElement;
	item?: any;
	event?: IEventData;
	commitChanges?: () => void;
	cancelChanges?: () => void;
}
export interface EditorFactory {
	getEditor(column: Column, row?: number): EditorClass;
}
export interface EditCommand {
	row: number;
	cell: number;
	editor: Editor;
	serializedValue: any;
	prevSerializedValue: any;
	execute: () => void;
	undo: () => void;
}
export interface EditorClass {
	new (options: EditorOptions): Editor;
	suppressClearOnEdit?: boolean;
}
export interface Editor {
	destroy(): void;
	applyValue(item: any, value: any): void;
	focus(): void;
	isValueChanged(): boolean;
	keyCaptureList?: number[];
	loadValue(value: any): void;
	serializeValue(): any;
	position?(pos: Position): void;
	preClick?(): void;
	hide?(): void;
	show?(): void;
	validate?(): ValidationResult;
}
export interface EditController {
	commitCurrentEdit(): boolean;
	cancelCurrentEdit(): boolean;
}
/***
 * A locking helper to track the active edit controller and ensure that only a single controller
 * can be active at a time.  This prevents a whole class of state and validation synchronization
 * issues.  An edit controller (such as SleekGrid) can query if an active edit is in progress
 * and attempt a commit or cancel before proceeding.
 * @class EditorLock
 * @constructor
 */
export declare class EditorLock {
	private activeEditController;
	/***
	 * Returns true if a specified edit controller is active (has the edit lock).
	 * If the parameter is not specified, returns true if any edit controller is active.
	 * @method isActive
	 * @param editController {EditController}
	 * @return {Boolean}
	 */
	isActive(editController?: EditController): boolean;
	/***
	 * Sets the specified edit controller as the active edit controller (acquire edit lock).
	 * If another edit controller is already active, and exception will be thrown.
	 * @method activate
	 * @param editController {EditController} edit controller acquiring the lock
	 */
	activate(editController: EditController): void;
	/***
	 * Unsets the specified edit controller as the active edit controller (release edit lock).
	 * If the specified edit controller is not the active one, an exception will be thrown.
	 * @method deactivate
	 * @param editController {EditController} edit controller releasing the lock
	 */
	deactivate(editController: EditController): void;
	/***
	 * Attempts to commit the current edit by calling "commitCurrentEdit" method on the active edit
	 * controller and returns whether the commit attempt was successful (commit may fail due to validation
	 * errors, etc.).  Edit controller's "commitCurrentEdit" must return true if the commit has succeeded
	 * and false otherwise.  If no edit controller is active, returns true.
	 * @method commitCurrentEdit
	 * @return {Boolean}
	 */
	commitCurrentEdit(): boolean;
	/***
	 * Attempts to cancel the current edit by calling "cancelCurrentEdit" method on the active edit
	 * controller and returns whether the edit was successfully cancelled.  If no edit controller is
	 * active, returns true.
	 * @method cancelCurrentEdit
	 * @return {Boolean}
	 */
	cancelCurrentEdit(): boolean;
}
/***
 * A global singleton editor lock.
 * @class GlobalEditorLock
 * @static
 * @constructor
 */
export declare const GlobalEditorLock: EditorLock;
export interface Column<TItem = any> {
	asyncPostRender?: AsyncPostRender<TItem>;
	asyncPostRenderCleanup?: AsyncPostCleanup<TItem>;
	behavior?: any;
	cannotTriggerInsert?: boolean;
	cssClass?: string;
	defaultSortAsc?: boolean;
	editor?: EditorClass;
	editorFixedDecimalPlaces?: number;
	field?: string;
	frozen?: boolean;
	focusable?: boolean;
	footerCssClass?: string;
	format?: ColumnFormat<TItem>;
	/** @deprecated */
	formatter?: CompatFormatter<TItem>;
	groupTotalsFormatter?: (p1?: GroupTotals<TItem>, p2?: Column<TItem>, grid?: unknown) => string;
	headerCssClass?: string;
	id?: string;
	maxWidth?: any;
	minWidth?: number;
	name?: string;
	nameIsHtml?: boolean;
	previousWidth?: number;
	referencedFields?: string[];
	rerenderOnResize?: boolean;
	resizable?: boolean;
	selectable?: boolean;
	sortable?: boolean;
	sortOrder?: number;
	toolTip?: string;
	validator?: (value: any, editorArgs?: any) => ValidationResult;
	visible?: boolean;
	width?: number;
}
export declare const columnDefaults: Partial<Column>;
export interface ColumnMetadata<TItem = any> {
	colspan: number | "*";
	cssClasses?: string;
	editor?: EditorClass;
	format?: ColumnFormat<TItem>;
	/** @deprecated */
	formatter?: CompatFormatter<TItem>;
}
export interface ColumnSort {
	columnId: string;
	sortAsc?: boolean;
}
export interface ItemMetadata<TItem = any> {
	cssClasses?: string;
	columns?: {
		[key: string]: ColumnMetadata<TItem>;
	};
	focusable?: boolean;
	format?: ColumnFormat<TItem>;
	/** @deprecated */
	formatter?: CompatFormatter<TItem>;
	selectable?: boolean;
}
export declare function initializeColumns(columns: Column[], defaults: Partial<Column<any>>): void;
export declare function titleize(str: string): string;
export declare class Range {
	fromRow: number;
	fromCell: number;
	toRow: number;
	toCell: number;
	constructor(fromRow: number, fromCell: number, toRow?: number, toCell?: number);
	/***
	 * Returns whether a range represents a single row.
	 */
	isSingleRow(): boolean;
	/***
	 * Returns whether a range represents a single cell.
	 */
	isSingleCell(): boolean;
	/***
	 * Returns whether a range contains a given cell.
	 */
	contains(row: number, cell: number): boolean;
	/***
	 * Returns a readable representation of a range.
	 */
	toString(): string;
}
export declare function addClass(el: Element, cls: string): void;
export declare function escape(s: any): any;
export declare function disableSelection(target: HTMLElement): void;
export declare function removeClass(el: Element, cls: string): void;
export declare function H<K extends keyof HTMLElementTagNameMap>(tag: K, attr?: {
	ref?: (el?: HTMLElementTagNameMap[K]) => void;
	[key: string]: string | number | boolean | ((el?: HTMLElementTagNameMap[K]) => void) | null | undefined;
}, ...children: (string | Node)[]): HTMLElementTagNameMap[K];
export declare function spacerDiv(width: string): HTMLDivElement;
export declare function parsePx(str: string): number;
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
	setSelectedRanges(ranges: Range[]): void;
	onSelectedRangesChanged: EventEmitter<Range[]>;
	refreshSelections?(): void;
}
export interface ViewRange {
	top?: number;
	bottom?: number;
	leftPx?: number;
	rightPx?: number;
}
export interface LayoutHost {
	bindAncestorScroll(el: HTMLElement): void;
	cleanUpAndRenderCells(range: ViewRange): void;
	getAvailableWidth(): number;
	getCellFromPoint(x: number, y: number): RowCell;
	getColumnCssRules(idx: number): {
		right: any;
		left: any;
	};
	getColumns(): Column[];
	getContainerNode(): HTMLElement;
	getDataLength(): number;
	getOptions(): GridOptions;
	getRowFromNode(rowNode: HTMLElement): number;
	getScrollDims(): {
		width: number;
		height: number;
	};
	getScrollLeft(): number;
	getScrollTop(): number;
	getViewportInfo(): ViewportInfo;
	renderRows(range: ViewRange): void;
}
export interface LayoutEngine {
	appendCachedRow(row: number, rowNodeL: HTMLElement, rowNodeR: HTMLElement): void;
	afterHeaderColumnDrag(): void;
	afterSetOptions(args: GridOptions): void;
	applyColumnWidths(): void;
	beforeCleanupAndRenderCells(rendered: ViewRange): void;
	afterRenderRows(rendered: ViewRange): void;
	bindAncestorScrollEvents(): void;
	calcCanvasWidth(): number;
	updateHeadersWidth(): void;
	isFrozenRow(row: number): boolean;
	destroy(): void;
	getCanvasNodeFor(cell: number, row: number): HTMLElement;
	getCanvasNodes(): HTMLElement[];
	getCanvasWidth(): number;
	getRowFromCellNode(cellNode: HTMLElement, clientX: number, clientY: number): number;
	getFooterRowCols(): HTMLElement[];
	getFooterRowColsFor(cell: number): HTMLElement;
	getFooterRowColumn(cell: number): HTMLElement;
	getFrozenCols(): number;
	getFrozenRowOffset(row: number): number;
	getFrozenRows(): number;
	getHeaderCols(): HTMLElement[];
	getHeaderColsFor(cell: number): HTMLElement;
	getHeaderColumn(cell: number): HTMLElement;
	getHeaderRowCols(): HTMLElement[];
	getHeaderRowColsFor(cell: number): HTMLElement;
	getHeaderRowColumn(cell: number): HTMLElement;
	getScrollCanvasY(): HTMLElement;
	getScrollContainerX(): HTMLElement;
	getScrollContainerY(): HTMLElement;
	getTopPanelFor(arg0: number): HTMLElement;
	getTopPanelNodes(): HTMLElement[];
	getViewportNodeFor(cell: number, row: number): HTMLElement;
	getViewportNodes(): HTMLElement[];
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
	defaultFormat?: ColumnFormat<TItem>;
	defaultFormatter?: CompatFormatter<TItem>;
	editable?: boolean;
	editCommandHandler?: (item: TItem, column: Column<TItem>, command: EditCommand) => void;
	editorCellNavOnLRKeys?: boolean;
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
	forceSyncScrollInterval?: number;
	formatterFactory?: FormatterFactory;
	frozenBottom?: boolean;
	frozenColumns?: number;
	frozenRows?: number;
	fullWidthRows?: boolean;
	groupingPanel?: boolean;
	groupingPanelHeight?: number;
	groupTotalsFormatter?: (p1?: GroupTotals<TItem>, p2?: Column<TItem>, grid?: any) => string;
	headerRowHeight?: number;
	jQuery?: JQueryStatic;
	leaveSpaceForNewRows?: boolean;
	layoutEngine?: LayoutEngine;
	minBuffer?: number;
	multiColumnSort?: boolean;
	multiSelect?: boolean;
	preHeaderPanelHeight?: number;
	renderAllCells?: boolean;
	rowHeight?: number;
	rtl?: boolean;
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
	useCssVars?: boolean;
	viewportClass?: string;
}
export declare const gridDefaults: GridOptions;
export declare class Grid<TItem = any> implements EditorHost {
	private _absoluteColMinWidth;
	private _activeCanvasNode;
	private _activeCell;
	private _activeCellNode;
	private _activePosX;
	private _activeRow;
	private _activeViewportNode;
	private _cellCssClasses;
	private _cellHeightDiff;
	private _cellWidthDiff;
	private _cellNavigator;
	private _colById;
	private _colDefaults;
	private _colLeft;
	private _colRight;
	private _cols;
	private _columnCssRulesL;
	private _columnCssRulesR;
	private _currentEditor;
	private _data;
	private _editController;
	private _headerColumnWidthDiff;
	private _hEditorLoader;
	private _hPostRender;
	private _hPostRenderCleanup;
	private _hRender;
	private _ignoreScrollUntil;
	private _initColById;
	private _initCols;
	private _initialized;
	private _jQuery;
	private _jumpinessCoefficient;
	private _lastRenderTime;
	private _layout;
	private _numberOfPages;
	private _options;
	private _page;
	private _pageHeight;
	private _pageOffset;
	private _pagingActive;
	private _pagingIsLastPage;
	private _plugins;
	private _postProcessCleanupQueue;
	private _postProcessedRows;
	private _postProcessFromRow;
	private _postProcessGroupId;
	private _postProcessToRow;
	private _rowsCache;
	private _scrollDims;
	private _scrollLeft;
	private _scrollLeftPrev;
	private _scrollLeftRendered;
	private _scrollTop;
	private _scrollTopPrev;
	private _scrollTopRendered;
	private _selectedRows;
	private _selectionModel;
	private _serializedEditorValue;
	private _sortColumns;
	private _styleNode;
	private _stylesheet;
	private _tabbingDirection;
	private _uid;
	private _viewportInfo;
	private _vScrollDir;
	private _boundAncestorScroll;
	private _container;
	private _focusSink1;
	private _focusSink2;
	private _groupingPanel;
	readonly onActiveCellChanged: EventEmitter<ArgsCell, IEventData>;
	readonly onActiveCellPositionChanged: EventEmitter<ArgsGrid, IEventData>;
	readonly onAddNewRow: EventEmitter<ArgsAddNewRow, IEventData>;
	readonly onBeforeCellEditorDestroy: EventEmitter<ArgsEditorDestroy, IEventData>;
	readonly onBeforeDestroy: EventEmitter<ArgsGrid, IEventData>;
	readonly onBeforeEditCell: EventEmitter<ArgsCellEdit, IEventData>;
	readonly onBeforeFooterRowCellDestroy: EventEmitter<ArgsColumnNode, IEventData>;
	readonly onBeforeHeaderCellDestroy: EventEmitter<ArgsColumnNode, IEventData>;
	readonly onBeforeHeaderRowCellDestroy: EventEmitter<ArgsColumnNode, IEventData>;
	readonly onCellChange: EventEmitter<ArgsCellChange, IEventData>;
	readonly onCellCssStylesChanged: EventEmitter<ArgsCssStyle, IEventData>;
	readonly onClick: EventEmitter<ArgsCell, MouseEvent>;
	readonly onColumnsReordered: EventEmitter<ArgsGrid, IEventData>;
	readonly onColumnsResized: EventEmitter<ArgsGrid, IEventData>;
	readonly onCompositeEditorChange: EventEmitter<ArgsGrid, IEventData>;
	readonly onContextMenu: EventEmitter<ArgsGrid, UIEvent>;
	readonly onDblClick: EventEmitter<ArgsCell, MouseEvent>;
	readonly onDrag: EventEmitter<ArgsGrid, UIEvent>;
	readonly onDragEnd: EventEmitter<ArgsGrid, UIEvent>;
	readonly onDragInit: EventEmitter<ArgsGrid, UIEvent>;
	readonly onDragStart: EventEmitter<ArgsGrid, UIEvent>;
	readonly onFooterRowCellRendered: EventEmitter<ArgsColumnNode, IEventData>;
	readonly onHeaderCellRendered: EventEmitter<ArgsColumnNode, IEventData>;
	readonly onHeaderClick: EventEmitter<ArgsColumn, IEventData>;
	readonly onHeaderContextMenu: EventEmitter<ArgsColumn, IEventData>;
	readonly onHeaderMouseEnter: EventEmitter<ArgsColumn, MouseEvent>;
	readonly onHeaderMouseLeave: EventEmitter<ArgsColumn, MouseEvent>;
	readonly onHeaderRowCellRendered: EventEmitter<ArgsColumnNode, IEventData>;
	readonly onKeyDown: EventEmitter<ArgsCell, KeyboardEvent>;
	readonly onMouseEnter: EventEmitter<ArgsGrid, MouseEvent>;
	readonly onMouseLeave: EventEmitter<ArgsGrid, MouseEvent>;
	readonly onScroll: EventEmitter<ArgsScroll, IEventData>;
	readonly onSelectedRowsChanged: EventEmitter<ArgsSelectedRowsChange, IEventData>;
	readonly onSort: EventEmitter<ArgsSort, IEventData>;
	readonly onValidationError: EventEmitter<ArgsValidationError, IEventData>;
	readonly onViewportChanged: EventEmitter<ArgsGrid, IEventData>;
	constructor(container: JQuery | HTMLElement, data: any, columns: Column<TItem>[], options: GridOptions<TItem>);
	private createGroupingPanel;
	private bindAncestorScroll;
	init(): void;
	private hasFrozenColumns;
	private hasFrozenRows;
	registerPlugin(plugin: IPlugin): void;
	unregisterPlugin(plugin: IPlugin): void;
	getPluginByName(name: string): IPlugin;
	setSelectionModel(model: SelectionModel): void;
	private unregisterSelectionModel;
	getScrollBarDimensions(): {
		width: number;
		height: number;
	};
	getDisplayedScrollbarDimensions(): {
		width: number;
		height: number;
	};
	getAbsoluteColumnMinWidth(): number;
	getSelectionModel(): SelectionModel;
	private colIdOrIdxToCell;
	getCanvasNode(columnIdOrIdx?: string | number, row?: number): HTMLElement;
	getCanvases(): JQuery | HTMLElement[];
	getActiveCanvasNode(e?: IEventData): HTMLElement;
	getViewportNode(columnIdOrIdx?: string | number, row?: number): HTMLElement;
	private getViewports;
	getActiveViewportNode(e?: IEventData): HTMLElement;
	private getAvailableWidth;
	private updateCanvasWidth;
	private unbindAncestorScrollEvents;
	updateColumnHeader(columnId: string, title?: string, toolTip?: string): void;
	getHeader(): HTMLElement;
	getHeaderColumn(columnIdOrIdx: string | number): HTMLElement;
	getGroupingPanel(): HTMLElement;
	getPreHeaderPanel(): HTMLElement;
	getHeaderRow(): HTMLElement;
	getHeaderRowColumn(columnIdOrIdx: string | number): HTMLElement;
	getFooterRow(): HTMLElement;
	getFooterRowColumn(columnIdOrIdx: string | number): HTMLElement;
	private createColumnFooters;
	private createColumnHeaders;
	private setupColumnSort;
	private setupColumnReorder;
	private setupColumnResize;
	private setOverflow;
	private measureCellPaddingAndBorder;
	private createCssRules;
	private getColumnCssRules;
	private removeCssRules;
	destroy(): void;
	private trigger;
	getEditorLock(): EditorLock;
	getEditController(): EditController;
	getColumnIndex(id: string): number;
	getInitialColumnIndex(id: string): number;
	autosizeColumns(): void;
	private applyColumnHeaderWidths;
	setSortColumn(columnId: string, ascending: boolean): void;
	setSortColumns(cols: ColumnSort[]): void;
	getSortColumns(): ColumnSort[];
	private handleSelectedRangesChanged;
	getColumns(): Column<TItem>[];
	getInitialColumns(): Column<TItem>[];
	private updateViewColLeftRight;
	private setInitialCols;
	setColumns(columns: Column<TItem>[]): void;
	getOptions(): GridOptions<TItem>;
	setOptions(args: GridOptions<TItem>, suppressRender?: boolean, suppressColumnSet?: boolean, suppressSetOverflow?: boolean): void;
	private validateAndEnforceOptions;
	private viewOnRowCountChanged;
	private viewOnRowsChanged;
	private viewOnDataChanged;
	private bindToData;
	private unbindFromData;
	setData(newData: any, scrollToTop?: boolean): void;
	getData(): any;
	getDataLength(): number;
	private getDataLengthIncludingAddNew;
	getDataItem(i: number): TItem;
	getTopPanel(): HTMLElement;
	setTopPanelVisibility(visible: boolean): void;
	setColumnHeaderVisibility(visible: boolean, animate?: boolean): void;
	setFooterRowVisibility(visible: boolean): void;
	setGroupingPanelVisibility(visible: boolean): void;
	setPreHeaderPanelVisibility(visible: boolean): void;
	setHeaderRowVisibility(visible: boolean): void;
	getContainerNode(): HTMLElement;
	getUID(): string;
	private getRowTop;
	private getRowFromPosition;
	private scrollTo;
	getFormatter(row: number, column: Column<TItem>): ColumnFormat<TItem>;
	getFormatterContext(row: number, cell: number): FormatterContext;
	private getEditor;
	getDataItemValueForColumn(item: TItem, columnDef: Column<TItem>): any;
	private appendRowHtml;
	private appendCellHtml;
	private cleanupRows;
	invalidate(): void;
	invalidateAllRows(): void;
	private queuePostProcessedRowForCleanup;
	private queuePostProcessedCellForCleanup;
	private removeRowFromCache;
	invalidateRows(rows: number[]): void;
	invalidateRow(row: number): void;
	updateCell(row: number, cell: number): void;
	private updateCellWithFormatter;
	updateRow(row: number): void;
	private calcViewportSize;
	resizeCanvas: () => void;
	updatePagingStatusFromView(pagingInfo: {
		pageSize: number;
		pageNum: number;
		totalPages: number;
	}): void;
	private updateRowCount;
	/**
	 * @param viewportTop optional viewport top
	 * @param viewportLeft optional viewport left
	 * @returns viewport range
	 */
	getViewport(viewportTop?: number, viewportLeft?: number): ViewRange;
	getVisibleRange(viewportTop?: number, viewportLeft?: number): ViewRange;
	getRenderedRange(viewportTop?: number, viewportLeft?: number): ViewRange;
	private ensureCellNodesInRowsCache;
	private cleanUpCells;
	private cleanUpAndRenderCells;
	private renderRows;
	private startPostProcessing;
	private startPostProcessingCleanup;
	private invalidatePostProcessingResults;
	private updateRowPositions;
	private updateGrandTotals;
	groupTotalsFormatter(p1?: GroupTotals<TItem>, p2?: Column<TItem>, grid?: any): string;
	render: () => void;
	private handleHeaderRowScroll;
	private handleFooterRowScroll;
	private handleMouseWheel;
	private handleScroll;
	private asyncPostProcessRows;
	private asyncPostProcessCleanupRows;
	private updateCellCssStylesOnRenderedRows;
	addCellCssStyles(key: string, hash: CellStylesHash): void;
	removeCellCssStyles(key: string): void;
	setCellCssStyles(key: string, hash: CellStylesHash): void;
	getCellCssStyles(key: string): CellStylesHash;
	flashCell(row: number, cell: number, speed?: number): void;
	private handleDragInit;
	private handleDragStart;
	private handleDrag;
	private handleDragEnd;
	private handleKeyDown;
	private handleClick;
	private handleContextMenu;
	private handleDblClick;
	private handleHeaderMouseEnter;
	private handleHeaderMouseLeave;
	private handleHeaderContextMenu;
	private handleHeaderClick;
	private handleMouseEnter;
	private handleMouseLeave;
	private cellExists;
	getCellFromPoint(x: number, y: number): {
		row: number;
		cell: number;
	};
	getCellFromNode(cellNode: Element): number;
	getColumnFromNode(cellNode: Element): Column<TItem>;
	getRowFromNode(rowNode: Element): number;
	getCellFromEvent(e: any): {
		row: number;
		cell: number;
	};
	getCellNodeBox(row: number, cell: number): {
		top: number;
		right: number;
		bottom: number;
		left: number;
	};
	resetActiveCell(): void;
	focus(): void;
	private setFocus;
	scrollCellIntoView(row: number, cell: number, doPaging?: boolean): void;
	scrollColumnIntoView(cell: number): void;
	private internalScrollColumnIntoView;
	private setActiveCellInternal;
	clearTextSelection(): void;
	private isCellPotentiallyEditable;
	private makeActiveCellNormal;
	editActiveCell(editor?: EditorClass): void;
	private makeActiveCellEditable;
	private commitEditAndSetFocus;
	private cancelEditAndSetFocus;
	private getActiveCellPosition;
	getGridPosition(): Position;
	private handleActiveCellPositionChange;
	getCellEditor(): Editor;
	getActiveCell(): RowCell;
	getActiveCellNode(): HTMLElement;
	scrollActiveCellIntoView(): void;
	scrollRowIntoView(row: number, doPaging?: boolean): void;
	scrollRowToTop(row: number): void;
	private scrollPage;
	navigatePageDown(): void;
	navigatePageUp(): void;
	navigateTop(): void;
	navigateBottom(): void;
	navigateToRow(row: number): boolean;
	getColspan(row: number, cell: number): number;
	navigateRight(): boolean;
	navigateLeft(): boolean;
	navigateDown(): boolean;
	navigateUp(): boolean;
	navigateNext(): boolean;
	navigatePrev(): boolean;
	navigateRowStart(): boolean;
	navigateRowEnd(): boolean;
	/**
	 * @param {string} dir Navigation direction.
	 * @return {boolean} Whether navigation resulted in a change of active cell.
	 */
	navigate(dir: string): boolean;
	getCellNode(row: number, cell: number): HTMLElement;
	setActiveCell(row: number, cell: number): void;
	setActiveRow(row: number, cell: number, suppressScrollIntoView?: boolean): void;
	private canCellBeActive;
	canCellBeSelected(row: number, cell: number): any;
	gotoCell(row: number, cell: number, forceEdit?: boolean): void;
	commitCurrentEdit(): boolean;
	private cancelCurrentEdit;
	private rowsToRanges;
	getSelectedRows(): number[];
	setSelectedRows(rows: number[]): void;
}
export interface ArgsGrid {
	grid?: Grid;
}
export interface ArgsColumn extends ArgsGrid {
	column: Column;
}
export interface ArgsColumnNode extends ArgsColumn {
	node: HTMLElement;
}
export type ArgsSortCol = {
	sortCol: Column;
	sortAsc: boolean;
};
export interface ArgsSort extends ArgsGrid {
	multiColumnSort: boolean;
	sortAsc?: boolean;
	sortCol?: Column;
	sortCols?: ArgsSortCol[];
}
export interface ArgsSelectedRowsChange extends ArgsGrid {
	rows: number[];
	changedSelectedRows?: number[];
	changedUnselectedRows?: number[];
	previousSelectedRows?: number[];
	caller: any;
}
export interface ArgsScroll extends ArgsGrid {
	scrollLeft: number;
	scrollTop: number;
}
export interface ArgsCssStyle extends ArgsGrid {
	key: string;
	hash: CellStylesHash;
}
export interface ArgsCell extends ArgsGrid {
	row: number;
	cell: number;
}
export interface ArgsCellChange extends ArgsCell {
	item: any;
}
export interface ArgsCellEdit extends ArgsCellChange {
	column: Column;
}
export interface ArgsAddNewRow extends ArgsColumn {
	item: any;
}
export interface ArgsEditorDestroy extends ArgsGrid {
	editor: Editor;
}
export interface ArgsValidationError extends ArgsCell {
	editor: Editor;
	column: Column;
	cellNode: HTMLElement;
	validationResults: ValidationResult;
}
export declare const BasicLayout: {
	new (): LayoutEngine;
};
export declare const FrozenLayout: {
	new (): LayoutEngine;
};
export declare function PercentCompleteFormatter(ctx: FormatterContext): string;
export declare function PercentCompleteBarFormatter(ctx: FormatterContext): string;
export declare function YesNoFormatter(ctx: FormatterContext): "Yes" | "No";
export declare function CheckboxFormatter(ctx: FormatterContext): string;
export declare function CheckmarkFormatter(ctx: FormatterContext): "" | "<i class=\"slick-checkmark\"></i>";
export declare namespace Formatters {
	function PercentComplete(_row: number, _cell: number, value: any): string;
	function PercentCompleteBar(_row: number, _cell: number, value: any): string;
	function YesNo(_row: number, _cell: number, value: any): "Yes" | "No";
	function Checkbox(_row: number, _cell: number, value: any): string;
	function Checkmark(_row: number, _cell: number, value: any): "" | "<i class=\"slick-checkmark\"></i>";
}
declare abstract class BaseEditor {
	protected _input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
	protected _defaultValue: any;
	protected _args: EditorOptions;
	constructor(args: EditorOptions);
	abstract init(): void;
	destroy(): void;
	focus(): void;
	getValue(): string;
	setValue(val: string): void;
	loadValue(item: any): void;
	serializeValue(): any;
	applyValue(item: any, state: any): void;
	isValueChanged(): boolean;
	validate(): ValidationResult;
}
export declare class TextEditor extends BaseEditor {
	_input: HTMLInputElement;
	init(): void;
}
export declare class IntegerEditor extends TextEditor {
	serializeValue(): number;
	validate(): ValidationResult;
}
export declare class FloatEditor extends TextEditor {
	static AllowEmptyValue: boolean;
	static DefaultDecimalPlaces: number;
	getDecimalPlaces(): number;
	loadValue(item: any): void;
	serializeValue(): any;
	validate(): ValidationResult;
}
export declare class DateEditor extends TextEditor {
	private _calendarOpen;
	init(): void;
	destroy(): void;
	show(): void;
	hide(): void;
	position(position: Position): void;
}
export declare class YesNoSelectEditor extends BaseEditor {
	_input: HTMLSelectElement;
	init(): void;
	loadValue(item: any): void;
	serializeValue(): boolean;
	isValueChanged(): boolean;
	validate(): {
		valid: boolean;
		msg: string;
	};
}
export declare class CheckboxEditor extends BaseEditor {
	_input: HTMLInputElement;
	init(): void;
	loadValue(item: any): void;
	preClick(): void;
	serializeValue(): boolean;
	applyValue(item: any, state: any): void;
	isValueChanged(): boolean;
	validate(): {
		valid: boolean;
		msg: string;
	};
}
export declare class PercentCompleteEditor extends IntegerEditor {
	protected _picker: HTMLDivElement;
	init(): void;
	destroy(): void;
}
export declare class LongTextEditor extends BaseEditor {
	_input: HTMLTextAreaElement;
	protected _container: HTMLElement;
	protected _wrapper: HTMLDivElement;
	init(): void;
	handleKeyDown(e: KeyboardEvent): void;
	save(): void;
	cancel(): void;
	hide(): void;
	show(): void;
	position(position: Position): void;
	destroy(): void;
}
export declare namespace Editors {
	const Text: typeof TextEditor;
	const Integer: typeof IntegerEditor;
	const Float: typeof FloatEditor;
	const Date: typeof DateEditor;
	const YesNoSelect: typeof YesNoSelectEditor;
	const Checkbox: typeof CheckboxEditor;
	const PercentComplete: typeof PercentCompleteEditor;
	const LongText: typeof LongTextEditor;
}
export interface GroupItemMetadataProviderOptions {
	enableExpandCollapse?: boolean;
	groupCellCssClass?: string;
	groupCssClass?: string;
	groupIndentation?: number;
	groupFocusable?: boolean;
	groupFormat?: ColumnFormat<Group>;
	groupFormatter?: CompatFormatter<Group>;
	groupLevelPrefix?: string;
	groupRowTotals?: boolean;
	groupTitleCssClass?: string;
	hasSummaryType?: (column: Column) => boolean;
	toggleCssClass?: string;
	toggleExpandedCssClass?: string;
	toggleCollapsedCssClass?: string;
	totalsCssClass?: string;
	totalsFocusable?: boolean;
	totalsFormat?: ColumnFormat<GroupTotals>;
	totalsFormatter?: CompatFormatter<GroupTotals>;
}
export declare class GroupItemMetadataProvider {
	protected grid: Pick<Grid, "getActiveCell" | "getColumns" | "getData" | "getDataItem" | "getRenderedRange" | "onClick" | "onKeyDown" | "groupTotalsFormatter">;
	private options;
	constructor(opt?: GroupItemMetadataProviderOptions);
	static readonly defaults: GroupItemMetadataProviderOptions;
	static defaultGroupFormat(ctx: FormatterContext, opt?: GroupItemMetadataProviderOptions): string;
	static defaultTotalsFormat(ctx: FormatterContext, grid?: typeof this.prototype["grid"]): any;
	init(grid: typeof this.grid): void;
	readonly pluginName = "GroupItemMetadataProvider";
	destroy(): void;
	getOptions(): GroupItemMetadataProviderOptions;
	setOptions(value: GroupItemMetadataProviderOptions): void;
	handleGridClick: (e: MouseEvent, args: ArgsCell) => void;
	handleGridKeyDown: (e: KeyboardEvent, args: ArgsCell) => void;
	groupCellPosition: () => {
		cell: number;
		colspan: number | "*";
	};
	getGroupRowMetadata: ((item: Group) => ItemMetadata);
	getTotalsRowMetadata: ((item: GroupTotals) => ItemMetadata);
}
export interface AutoTooltipsOptions {
	enableForCells?: boolean;
	enableForHeaderCells?: boolean;
	maxToolTipLength?: number;
	replaceExisting?: boolean;
}
export declare class AutoTooltips implements IPlugin {
	private grid;
	private options;
	constructor(options?: AutoTooltipsOptions);
	static readonly defaults: AutoTooltipsOptions;
	init(grid: Grid): void;
	destroy(): void;
	private handleMouseEnter;
	private handleHeaderMouseEnter;
	pluginName: string;
}

export {};
