import { Column, H, parsePx, spacerDiv } from "../core";
import { LayoutEngine, LayoutHost } from "./layout";

export const BasicLayout: { new(): LayoutEngine } = function(): LayoutEngine {
    var host: LayoutHost;
    var canvasWidth: number;
    var headersWidth: number;

    var canvas: HTMLDivElement;
    var headerCols: HTMLDivElement;
    var headerRowCols: HTMLDivElement;
    var headerRowSpacer: HTMLDivElement;
    var footerRowCols: HTMLDivElement;
    var footerRowSpacer: HTMLDivElement;
    var topPanel: HTMLDivElement;
    var viewport: HTMLDivElement;

    function init(hostGrid: LayoutHost) {
        host = hostGrid;
        const spacerW = calcCanvasWidth() + host.getScrollDims().width + 'px';
        const options = host.getOptions();
        const uisd = options.useLegacyUI ? ' ui-state-default' : '';

        headerCols = H('div', { class: 'slick-header-columns', style: (options.rtl ? 'right' : 'left') + ':-1000px' });
        var headerColsS = H('div', { class: 'slick-header' + uisd, style: !options.showColumnHeader && 'display: none' }, headerCols);
        updateHeadersWidth();

        headerRowCols = H('div', { class: 'slick-headerrow-columns' });
        headerRowSpacer = spacerDiv(spacerW);
        var headerRow = H('div', { class: 'slick-headerrow' + uisd, style: !options.showHeaderRow && 'display: none' }, headerRowCols, headerRowSpacer);

        topPanel = H('div', { class: 'slick-top-panel', style: 'width: 10000px' });
        var topPanelS = H('div', { class: 'slick-top-panel-scroller' + uisd, style: !options.showTopPanel && 'display: none' }, topPanel);

        canvas = H('div', { class: "grid-canvas", tabIndex: "0", hideFocus: '' })
        viewport = H('div', { class: "slick-viewport", tabIndex: "0", hideFocus: '' }, canvas);

        footerRowCols = H('div', { class: 'slick-footerrow-columns' });
        footerRowSpacer = spacerDiv(spacerW);
        var footerRow = H('div', { class: 'slick-footerrow' + uisd, style: !options.showFooterRow && 'display: none' }, footerRowCols, footerRowSpacer);

        host.getContainerNode().append(headerColsS, headerRow, topPanelS, viewport, footerRow);
    }

    function appendCachedRow(_: number, rowNode: HTMLDivElement): void {
        rowNode && canvas.appendChild(rowNode);
    }

    function applyColumnWidths() {
        var x = 0, w, rule, cols = host.getColumns(), opts = host.getOptions(), rtl = opts.rtl;

        if (opts.useCssVars) {
            var styles = host.getContainerNode().style;
            for (var i = 0; i < cols.length; i++) {
                w = cols[i].width;
                var prop = "--l" + i;
                var oldVal = styles.getPropertyValue(prop);
                var newVal = x + "px";
                if (oldVal !== newVal) 
                    styles.setProperty(prop, newVal);
                prop = "--r" + i;
                oldVal = styles.getPropertyValue(prop);
                newVal = (canvasWidth - x - w) + "px"
                if (oldVal !== newVal) 
                    styles.setProperty(prop, newVal);
                x += w;
            }
        }
        else {
            for (var i = 0; i < cols.length; i++) {
                w = cols[i].width;
                rule = host.getColumnCssRules(i);
                rule[rtl ? 'right' : 'left'].style[rtl ? 'right' : 'left'] = x + "px";
                rule[rtl ? 'left' : 'right'].style[rtl ? 'left' : 'right'] = (canvasWidth - x - w) + "px";
                x += w;
            }
        }
    }

    function bindAncestorScrollEvents(): void {
        var elem: HTMLElement = canvas;
        while ((elem = elem.parentNode as HTMLElement) != document.body && elem != null) {
            // bind to scroll containers only
            if (elem == viewport || elem.scrollWidth != elem.clientWidth || elem.scrollHeight != elem.clientHeight) {
                host.bindAncestorScroll(elem);
            }
        }
    }

    function calcCanvasWidth() {
        var cols = host.getColumns(), i = cols.length;
        var rowWidth = 0;
        while (i--) {
            rowWidth += cols[i].width;
        }

        return host.getOptions().fullWidthRows ? Math.max(rowWidth,
            host.getAvailableWidth()) : rowWidth;
    }

    function updateHeadersWidth() {
        headersWidth = 0;

        var scrollWidth = host.getScrollDims().width;
        var cols = host.getColumns();
        for (var i = 0, ii = cols.length; i < ii; i++) {
            headersWidth +=  cols[i].width;
        }

        headersWidth += scrollWidth;
        headersWidth = Math.max(headersWidth, host.getViewportInfo().width) + 1000;
        headerCols.style.width = headersWidth + 'px';
    }

    const destroy = () => {
        host = null;
    }

    function getCanvasNodeFor() {
        return canvas;
    }

    function getCanvasNodes() {
        return [canvas];
    }

    function getCanvasWidth() {
        return canvasWidth;
    }

    function getHeaderCols() {
        return [headerCols];
    }

    function getHeaderColumn(cell: number) {
        return headerCols.children.item(cell) as HTMLDivElement;
    }

    function getHeaderRowCols() {
        return [headerRowCols];
    }

    function getHeaderRowColumn(cell: number) {
        return headerRowCols.childNodes.item(cell) as HTMLDivElement;
    }

    function getHeaderRowColsFor() {
        return headerRowCols;
    }

    function getFooterRowColumn(cell: number) {
        return footerRowCols.childNodes.item(cell) as HTMLDivElement;
    }

    function getFooterRowColsFor() {
        return footerRowCols;
    }

    function getHeaderColsFor() {
        return headerCols;
    }

    function getFooterRowCols(): HTMLDivElement[] {
        return [footerRowCols];
    }

    function getRowFromCellNode(cellNode: HTMLElement): number {
        return host.getRowFromNode(cellNode.parentElement);
    }

    function getTopPanelFor() {
        return topPanel;
    }

    function getTopPanelNodes() {
        return [topPanel];
    }

    function getViewportNodeFor(): HTMLDivElement {
        return viewport;
    }

    function getViewportNodes(): HTMLDivElement[] {
        return [viewport];
    }

    function handleScrollH(): void {
        headerCols.parentElement.scrollLeft = host.getScrollLeft();
        topPanel.parentElement.scrollLeft = host.getScrollLeft();
        headerRowCols.parentElement.scrollLeft = host.getScrollLeft();
        footerRowCols.parentElement.scrollLeft = host.getScrollLeft();
    }

    function noop(): void {
    }

    function realScrollHeightChange() {
        canvas.style.height = host.getViewportInfo().realScrollHeight + 'px'
    }

    function reorderViewColumns(viewCols: Column[]): Column[] {
        return viewCols;
    }

    function returnFalse() {
        return false;
    }

    function setOverflow(): void {
        var alwaysVS = host.getOptions().alwaysShowVerticalScroll;

        viewport.style.overflowX = 'auto';
        viewport.style.overflowY = alwaysVS ? 'scroll' : (host.getOptions().autoHeight ? 'hidden' : 'auto');
    }

    function updateCanvasWidth(): boolean {
        var oldCanvasWidth = canvasWidth;
        canvasWidth = calcCanvasWidth();
        var scrollWidth = host.getScrollDims().width;

        const vpi = host.getViewportInfo();
        var canvasWidthPx = canvasWidth + 'px'
        canvas.style.width = canvasWidthPx;
        headerRowCols.style.width = canvasWidthPx;
        footerRowCols.style.width = canvasWidthPx;
        updateHeadersWidth();
        vpi.hasHScroll = (canvasWidth > host.getViewportInfo().width - scrollWidth);

        var spacerWidthPx = (canvasWidth + (vpi.hasVScroll ? scrollWidth : 0)) + 'px';
        headerRowSpacer.style.width = spacerWidthPx;
        footerRowSpacer.style.width = spacerWidthPx;

        return canvasWidth != oldCanvasWidth;
    }

    const resizeCanvas = () => {
        var vs = host.getViewportInfo();
        var _paneTopH = vs.height + vs.topPanelHeight + vs.headerRowHeight + vs.footerRowHeight;
        const options = host.getOptions();
        if (options.autoHeight) {
            host.getContainerNode().style.height = (_paneTopH + vs.groupingPanelHeight +
                parsePx(getComputedStyle(headerCols.parentElement).height)) + 'px';
            viewport.style.height = '';
        }
        else
            viewport.style.height = vs.height + 'px'
    }

    function returnZero() {
        return 0;
    }

    var intf: LayoutEngine = {
        afterHeaderColumnDrag: noop,
        afterRenderRows: noop,
        afterSetOptions: noop,
        appendCachedRow,
        applyColumnWidths,
        beforeCleanupAndRenderCells: noop,
        bindAncestorScrollEvents,
        calcCanvasWidth,
        updateHeadersWidth,
        isFrozenRow: returnFalse,
        destroy,
        getCanvasNodeFor,
        getCanvasNodes,
        getCanvasWidth,
        getFooterRowCols,
        getFooterRowColsFor,
        getFooterRowColumn,
        getHeaderCols,
        getHeaderColsFor,
        getHeaderColumn,
        getHeaderRowCols,
        getHeaderRowColsFor,
        getHeaderRowColumn,
        getRowFromCellNode,
        getFrozenCols: returnZero,
        getFrozenRowOffset: returnZero,
        getFrozenRows: returnZero,
        getScrollCanvasY: getCanvasNodeFor,
        getScrollContainerX: getViewportNodeFor,
        getScrollContainerY: getViewportNodeFor,
        getTopPanelFor,
        getTopPanelNodes,
        getViewportNodeFor,
        getViewportNodes,
        handleScrollH,
        handleScrollV: noop,
        init,
        layoutName: "basic",
        realScrollHeightChange,
        reorderViewColumns,
        resizeCanvas,
        setOverflow,
        setPaneVisibility: noop,
        setScroller: noop,
        updateCanvasWidth
    }

    return intf;
} as any;
