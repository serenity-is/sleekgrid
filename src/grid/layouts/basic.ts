import { Column } from "../column";
import { H, spacerDiv } from "../internal";
import { LayoutEngine, LayoutHost } from "./layout";

export function basicLayout(): LayoutEngine {
    var host: LayoutHost;
    var _canvasWidth: number;
    var _canvasWidthL: number;
    var _headersWidthL: number;
    var _viewportHasHScroll: boolean;
    var _viewportHasVScroll: boolean;

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

    function init(hostGrid: LayoutHost) {
        host = hostGrid;
        const spacerW = calcCanvasWidth() + host.getScrollDims().width + 'px';
        const options = host.getOptions();
        const uisd = options.useLegacyUI ? ' ui-state-default' : '';

        _headerColsL = H('div', { class: 'slick-header-columns', style: options.rtl + ':-1000px' });
        _paneHeaderL = H('div', { class: "slick-pane slick-pane-header", tabIndex: '0' },
            H('div', { class: 'slick-header' + uisd, style: !options.showColumnHeader && 'display: none' }, _headerColsL));

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
    }

    function applyColumnWidths() {
        var x = 0, w, rule, cols = host.getColumns();
        for (var i = 0; i < cols.length; i++) {
            w = cols[i].width;
            rule = host.getColumnCssRules(i);
            const rtl = host.getOptions().rtl;
            rule[rtl ? 'left' : 'right'].style[rtl ? 'left' : 'right'] = x + "px";
            rule[rtl ? 'right' : 'left'].style[rtl ? 'left' : 'right'] = _canvasWidthL - x - w + "px";
            x += w;
        }
    }    

    function bindAncestorScrollEvents(): void {
        var elem: HTMLElement = _canvasTopL;
        while ((elem = elem.parentNode as HTMLElement) != document.body && elem != null) {
            // bind to scroll containers only
            if (elem == _viewportTopL || elem.scrollWidth != elem.clientWidth || elem.scrollHeight != elem.clientHeight) {
                host.bindAncestorScroll(elem);
            }
        }
    }

    function calcCanvasWidth() {
        var cols = host.getColumns(), i = cols.length;

        _canvasWidthL = 0;

        while (i--) {
            _canvasWidthL += cols[i].width;
        }

        _canvasWidth = host.getOptions().fullWidthRows ? Math.max(_canvasWidthL, 
            host.getAvailableWidth()) : _canvasWidthL;

        return _canvasWidth;
    }

    function calcHeaderWidths() {
        _headersWidthL = 0;

        var scrollWidth = host.getScrollDims().width;
        var cols = host.getColumns();
        for (var i = 0, ii = cols.length; i < ii; i++) {
            _headersWidthL +=  cols[i].width;
        }

        _headersWidthL += scrollWidth;
        _headersWidthL = Math.max(_headersWidthL, host.getViewportSize().width) + 1000;
        _headerColsL.style.width = _headersWidthL + 'px';
    }

    function getCanvasNodeFor() {
        return _canvasTopL;
    }

    function getCanvasNodes() {
        return [_canvasTopL];
    }

    function getCanvasWidth() {
        return _canvasWidth;
    }

    function getHeaderCols() {
        return [_headerColsL];
    }

    function getHeaderColumn(cell: number) {
        return _headerColsL.children.item(cell) as HTMLDivElement;
    }

    function getHeaderRowCols() {
        return [_headerRowColsL];
    }

    function getHeaderRowColumn(cell: number) {
        return _headerRowColsL.childNodes.item(cell) as HTMLDivElement;
    }

    function getHeaderRowColsFor() {
        return _headerRowColsL;
    }

    function getFooterRowColumn(cell: number) {
        return _footerRowColsL.childNodes.item(cell) as HTMLDivElement;
    }

    function getFooterRowColsFor() {
        return _footerRowColsL;
    }

    function getHeaderColsFor() {
        return _headerColsL;
    }

    function getFooterRowCols(): HTMLDivElement[] {
        return [_footerRowColsL];
    }

    function getViewportHasHScroll(): boolean {
        return _viewportHasHScroll;
    }

    function getViewportHasVScroll(): boolean {
        return _viewportHasVScroll;
    }

    function getViewportNodeFor(): HTMLDivElement {
        return _viewportTopL;
    }

    function getViewportNodes(): HTMLDivElement[] {
        return [_viewportTopL];
    }

    function handleScrollH(): void {
        _headerColsL.parentElement.scrollLeft = host.getScrollLeft();
        _topPanelL.parentElement.scrollLeft = host.getScrollLeft();
        _headerRowColsL.parentElement.scrollLeft = host.getScrollLeft();
        _footerRowColsL.parentElement.scrollLeft = host.getScrollLeft();
    }

    function updateCanvasWidth(): boolean {
        var oldCanvasWidth = _canvasWidth;
        var widthChanged;
        calcCanvasWidth();
        var scrollWidth = host.getScrollDims().width;

        widthChanged = _canvasWidth !== oldCanvasWidth;

        if (widthChanged) {
            var cwl = _canvasWidth + 'px'

            _canvasTopL.style.width = cwl;

            calcHeaderWidths();

            _paneHeaderL.style.width = '100%';
            _paneTopL.style.width = '100%';
            _headerRowColsL.parentElement.style.width = '100%';
            _headerRowColsL.style.width = _canvasWidth + 'px';
            _footerRowColsL.parentElement.style.width = '100%';
            _footerRowColsL.style.width = _canvasWidth + 'px';
            _viewportTopL.style.width = '100%';

            _viewportHasHScroll = (_canvasWidth > host.getViewportSize().width - scrollWidth);
        }

        var w = (_canvasWidth + (_viewportHasVScroll ? scrollWidth : 0)) + 'px';

        _headerRowSpacerL.style.width = w;
        _footerRowSpacerL.style.width = w;

        return widthChanged;
    }

    function noop(): void {
    }

    function setOverflow(): void {
        var alwaysVS = host.getOptions().alwaysShowVerticalScroll;

        _viewportTopL.style.overflowX = 'auto';
        _viewportTopL.style.overflowY = alwaysVS ? 'scroll' : (host.getOptions().autoHeight ? 'hidden' : 'auto');
    }

    function getTopPanelNodes() {
        return [_topPanelL];
    }
    
    function getTopPanelFor() {
        return _topPanelL;
    }

    function reorderViewColumns(viewCols: Column[]): Column[] {
        return viewCols;
    }

    function canCleanupRow() {
        return true;
    }

    function realScrollHeightChange(h: number) {
        _canvasTopL.style.height = h + 'px'
    }

    const resizeCanvas = () => {
        var vs = host.getViewportSize();
        var _paneTopH = vs.height + vs.topPanelHeight + vs.headerRowHeight + vs.footerRowHeight;
        const options = host.getOptions();
        if (options.autoHeight) {
            host.getContainerNode().style.height = (_paneTopH + vs.groupingPanelHeight +
                parseFloat(getComputedStyle(_headerColsL.parentElement).height)) + 'px';
            _viewportTopL.style.height = '';
        }
        else
            _viewportTopL.style.height = vs.height + 'px'

        _paneTopL.style.top = (vs.groupingPanelHeight + (parseFloat(getComputedStyle(_paneHeaderL).height) || vs.headerHeight)) + "px";
        _paneTopL.style.height = _paneTopH + 'px';
    }


    const destroy = () => {
        host = null;
    }

    return {
        afterHeaderColumnDrag: noop,
        afterSetOptions: noop,
        applyColumnWidths,
        bindAncestorScrollEvents,
        calcCanvasWidth,
        calcHeaderWidths,
        canCleanupRow,
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
        getScrollCanvasY: getCanvasNodeFor,
        getScrollContainerX: getViewportNodeFor,
        getScrollContainerY: getViewportNodeFor,
        getTopPanelFor,
        getTopPanelNodes,
        getViewportHasHScroll,
        getViewportHasVScroll,
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
}