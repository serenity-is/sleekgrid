import { Column } from "../column";
import { GridOptions } from "../gridoptions";
import { disableSelection, H, spacerDiv } from "../internal";
import { LayoutHost, LayoutEngine } from "./layout";

export function frozenLayout(): LayoutEngine {
    var actualFrozenRow: number = -1;
    var frozenBottom: boolean;
    var frozenCols: number;
    var frozenRows: number;
    var _canvasWidth: number;
    var _canvasWidthL: number;
    var _canvasWidthR: number;
    var _headersWidthL: number;
    var _headersWidthR: number;
    var _paneBottomH: number = 0;
    var _paneTopH: number = 0;
    var _viewportHasHScroll: boolean;
    var _viewportHasVScroll: boolean;

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
    var _scrollContainerX: HTMLDivElement;
    var _scrollContainerY: HTMLDivElement;
    var _topPanelL: HTMLDivElement;
    var _topPanelR: HTMLDivElement;
    var _viewportBottomL: HTMLDivElement;
    var _viewportBottomR: HTMLDivElement;
    var _viewportTopL: HTMLDivElement;
    var _viewportTopR: HTMLDivElement;

    const calcCanvasWidth = () => {
        var cols = host.getColumns(), i = cols.length;

        _canvasWidthL = _canvasWidthR = 0;

        while (i--) {
            if (frozenCols > 0 && i >= frozenCols) {
                _canvasWidthR += cols[i].width;
            } else {
                _canvasWidthL += cols[i].width;
            }
        }

        var totalRowWidth = _canvasWidthL + _canvasWidthR;
        _canvasWidth = host.getOptions().fullWidthRows ? Math.max(totalRowWidth, host.getAvailableWidth()) : totalRowWidth;
        return _canvasWidth;
    }

    var host: LayoutHost;

    function init(hostGrid: LayoutHost) {
        host = hostGrid;
        const spacerW = calcCanvasWidth() + host.getScrollDims().width + 'px';
        const options = host.getOptions();
        const uisd = options.useLegacyUI ? ' ui-state-default' : '';

        // -- PANE HEADER LEFT
        _headerColsL = H('div', { class: 'slick-header-columns slick-header-columns-left', style: (options.rtl ? "left" : "right") + ':-1000px' });
        _paneHeaderL = H('div', { class: "slick-pane slick-pane-header slick-pane-left", tabIndex: '0' },
            H('div', { class: 'slick-header slick-header-left' + uisd, style: !options.showColumnHeader && 'display: none' }, _headerColsL));

        // -- PANE HEADER RIGHT
        _headerColsR = H('div', { class: 'slick-header-columns slick-header-columns-right', style: (options.rtl ? "left" : "right") + ':-1000px' });
        _paneHeaderR = H('div', { class: "slick-pane slick-pane-header slick-pane-right", tabIndex: '0' },
            H('div', { class: 'slick-header slick-header-right' + uisd, style: !options.showColumnHeader && 'display: none' }, _headerColsR));

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

        adjustFrozenRowOption();
    }

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

        var rightSide = cell >= frozenCols;

        if (frozenRows > 0 && (row >= actualFrozenRow + (frozenBottom ? 0 : 1)))
            return rightSide ? _canvasBottomR : _canvasBottomL;

        return rightSide ? _canvasTopR : _canvasTopL;
    }

    function getCanvasWidth() {
        return _canvasWidth;
    }

    function getCanvasNodes() {
        return [_canvasTopL, _canvasTopR, _canvasBottomL, _canvasBottomR];
    }

    function getScrollContainerX() {
        return _scrollContainerX;
    }

    function getScrollContainerY() {
        return _scrollContainerY;
    }

    function getViewportNodeFor(row: number, cell: number) {
        if (row == null && cell == null)
            return _canvasTopL;

        var rightSide = cell >= frozenCols;

        if (frozenRows > 0 && (row >= actualFrozenRow + (frozenBottom ? 0 : 1)))
            return rightSide ? _canvasBottomR : _canvasBottomL;

        return rightSide ? _canvasTopR : _canvasTopL;
    }

    function getViewportNodes() {
        return [_viewportTopL, _viewportTopR, _viewportBottomL, _viewportBottomR];
    }

    const updateCanvasWidth = () => {
        var oldCanvasWidth = _canvasWidth;
        var oldCanvasWidthL = _canvasWidthL;
        var oldCanvasWidthR = _canvasWidthR;
        var widthChanged;
        calcCanvasWidth();
        var scrollWidth = host.getScrollDims().width;

        widthChanged = _canvasWidth !== oldCanvasWidth || _canvasWidthL !== oldCanvasWidthL || _canvasWidthR !== oldCanvasWidthR;

        if (widthChanged || frozenCols || frozenRows) {
            var canvasWidthL = _canvasWidthL + 'px'
            var canvasWidthR = _canvasWidthR + 'px';

            _canvasTopL.style.width = canvasWidthL;

            calcHeaderWidths();
            var vs = host.getViewportSize();

            if (frozenCols) {
                var viewportMinus = (vs.width - _canvasWidthL) + 'px';
                const rtl = host.getOptions().rtl;

                _canvasTopR.style.width = canvasWidthR;
                _paneHeaderL.style.width = canvasWidthL;
                _paneHeaderR.style[rtl ? "left" : "right"] = canvasWidthL;
                _paneHeaderR.style.width = viewportMinus;

                _paneTopL.style.width = canvasWidthL;
                _paneTopR.style[rtl ? "left" : "right"] = canvasWidthL;
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

                if (frozenRows) {
                    _paneBottomL.style.width = canvasWidthL;
                    _paneBottomR.style[rtl ? "left" : "right"] = canvasWidthL;

                    _viewportBottomL.style.width = canvasWidthL;
                    _viewportBottomR.style.width = viewportMinus;

                    _canvasBottomL.style.width = canvasWidthL;
                    _canvasBottomR.style.width = canvasWidthR;
                }
            } else {
                _paneHeaderL.style.width = '100%';
                _paneTopL.style.width = '100%';
                _headerRowColsL.parentElement.style.width = '100%';
                _headerRowColsL.style.width = _canvasWidth + 'px';
                _footerRowColsL.parentElement.style.width = '100%';
                _footerRowColsL.style.width = _canvasWidth + 'px';
                _viewportTopL.style.width = '100%';

                if (frozenRows) {
                    _viewportBottomL.style.width = '100%';
                    _canvasBottomL.style.width = canvasWidthL;
                }
            }

            _viewportHasHScroll = (_canvasWidth > vs.width - scrollWidth);
        }

        var w = (_canvasWidth + (_viewportHasVScroll ? scrollWidth : 0)) + 'px';

        _headerRowSpacerL.style.width = w;
        _headerRowSpacerR.style.width = w;
        _footerRowSpacerL.style.width = w;
        _footerRowSpacerR.style.width = w;

        return widthChanged;
    }

    const getHeaderColumn = (cell: number) => {
        return (frozenCols > 0 && cell >= frozenCols ?
            _headerColsR.children.item(cell - frozenCols) : _headerColsL.children.item(cell)) as HTMLDivElement;
    }

    const getHeaderRowColumn = (cell: number) => {
        var target: HTMLDivElement;

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
        var target: HTMLDivElement;

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
        return frozenCols > 0 && cell >= frozenCols ? _headerRowColsR : _headerRowColsL;
    }

    const getFooterRowColsFor = (cell: number) => {
        return frozenCols > 0 && cell >= frozenCols ? _footerRowColsR : _footerRowColsL;
    }

    const calcHeaderWidths = () => {
        _headersWidthL = _headersWidthR = 0;

        var scrollWidth = host.getScrollDims().width;
        var cols = host.getColumns();
        for (var i = 0, ii = cols.length; i < ii; i++) {
            var width = cols[i].width;

            if (frozenCols > 0 && i >= frozenCols) {
                _headersWidthR += width;
            } else {
                _headersWidthL += width;
            }
        }

        const vs = host.getViewportSize();

        if (frozenCols > 0) {
            _headersWidthL = _headersWidthL + 1000;
            _headersWidthR = Math.max(_headersWidthR, vs.width) + _headersWidthL;
            _headersWidthR += scrollWidth;
        } else {
            _headersWidthL += scrollWidth;
            _headersWidthL = Math.max(_headersWidthL, vs.width) + 1000;
        }

        _headerColsL.style.width = _headersWidthL + 'px';
        _headerColsR.style.width = _headersWidthR + 'px';
    }

    const getHeaderColsFor = (cell: number) => {
        return frozenCols > 0 && cell >= frozenCols ? _headerColsR : _headerColsL;
    }

    const handleScrollH = () => {
        const scrollLeft = host.getScrollLeft();
        if (frozenCols) {
            _headerColsR.parentElement.scrollLeft = scrollLeft;
            _topPanelR.parentElement.scrollLeft = scrollLeft;
            _headerRowColsR.parentElement.scrollLeft = scrollLeft;
            _footerRowColsR.parentElement.scrollLeft = scrollLeft;
            if (frozenRows) {
                _viewportTopR.scrollLeft = scrollLeft;
            }
        } else {
            _headerColsL.parentElement.scrollLeft = scrollLeft;
            _topPanelL.parentElement.scrollLeft = scrollLeft;
            _headerRowColsL.parentElement.scrollLeft = scrollLeft;
            _footerRowColsL.parentElement.scrollLeft = scrollLeft;
            if (frozenRows) {
                _viewportTopL.scrollLeft = scrollLeft;
            }
        }
    }

    const handleScrollV = () => {
        if (frozenCols) {
            if (frozenRows && !frozenBottom) {
                _viewportBottomL.scrollTop = host.getScrollTop();
            } else {
                _viewportTopL.scrollTop = host.getScrollTop();
            }
        }
    }

    const setScroller = () => {
        if (frozenCols) {
            if (frozenRows) {
                if (frozenBottom) {
                    _scrollContainerX = _viewportBottomR;
                    _scrollContainerY = _viewportTopR;
                } else {
                    _scrollContainerX = _scrollContainerY = _viewportBottomR;
                }
            } else {
                _scrollContainerX = _scrollContainerY = _viewportTopR;
            }
        } else {
            if (frozenRows) {
                if (frozenBottom) {
                    _scrollContainerX = _viewportBottomL;
                    _scrollContainerY = _viewportTopL;
                } else {
                    _scrollContainerX = _scrollContainerY = _viewportBottomL;
                }
            } else {
                _scrollContainerX = _scrollContainerY = _viewportTopL;
            }
        }
    }

    const setPaneVisibility = () => {
        _paneHeaderR.style.display = _paneTopR.style.display = frozenCols ? '' : 'none';
        _paneBottomL.style.display = frozenRows ? '' : 'none';
        _paneBottomR.style.display = frozenRows && frozenCols ? '' : 'none';
    }

    const setOverflow = () => {
        const options = host.getOptions();
        var alwaysHS = options.alwaysAllowHorizontalScroll;
        var alwaysVS = options.alwaysShowVerticalScroll;

        _viewportTopL.style.overflowX = _viewportTopR.style.overflowX = (frozenRows && !alwaysHS) ? 'hidden' : (frozenCols ? 'scroll' : 'auto');
        _viewportTopL.style.overflowY = _viewportBottomL.style.overflowY = (!frozenCols && alwaysVS) ? 'scroll' :
            (frozenCols ? 'hidden' : (frozenRows ? 'scroll' : (options.autoHeight ? 'hidden' : 'auto')));
        _viewportTopR.style.overflowY = (alwaysVS || frozenRows) ? 'scroll' : (options.autoHeight ? 'hidden' : 'auto');
        _viewportBottomL.style.overflowX = _viewportBottomR.style.overflowX = (frozenCols && !alwaysHS) ? 'scroll' : 'auto';
        _viewportBottomR.style.overflowY = (alwaysVS) ? 'scroll' : 'auto';
    }

    const bindAncestorScrollEvents = () => {
        var elem: HTMLElement = (frozenRows && !frozenBottom) ? _canvasBottomL : _canvasTopL;
        while ((elem = elem.parentNode as HTMLElement) != document.body && elem != null) {
            // bind to scroll containers only
            if (elem == _viewportTopL || elem.scrollWidth != elem.clientWidth || elem.scrollHeight != elem.clientHeight) {
                host.bindAncestorScroll(elem);
            }
        }
    }

    const afterHeaderColumnDrag = () => {
        const oldCanvasWidthL = _canvasWidthL;
        calcCanvasWidth();
        if (frozenCols &&  _canvasWidthL != oldCanvasWidthL) {
            _headerColsL.style.width = _canvasWidthL + 1000 + 'px';
            _paneHeaderR.style[host.getOptions().rtl ? 'left' : 'right'] = _canvasWidthL + 'px';
        }
    }

    const applyColumnWidths = () => {
        var x = 0, w, rule, cols = host.getColumns(), 
            s = this._options.rtl ? 'left' : 'right',
            e = this._options.rtl ? 'right' : 'left';
        for (var i = 0; i < cols.length; i++) {
            if (frozenCols == i)
                x = 0;
            w = cols[i].width;
            rule = host.getColumnCssRules(i);
            rule[s].style[s] = x + "px";
            rule[e].style[e] = (((frozenCols > 0 && i >= frozenCols) ? _canvasWidthR : _canvasWidthL) - x - w) + "px";
            x += w;
        }
    }

    const getTopPanelFor = (cell: number) => {
        return frozenCols > 0 && cell >= frozenCols ? _topPanelR : _topPanelL;
    }

    const getTopPanelNodes = () => [_topPanelL, _topPanelR];

    const resizeCanvas = () => {
        var _paneTopH = 0
        var _paneBottomH = 0
        var vs = host.getViewportSize();

        // Account for Frozen Rows
        if (frozenRows) {
            const frozenRowsHeight = frozenRows * _options.rowHeight;
            if (_options.frozenBottom) {
                _paneTopH = _viewportH - frozenRowsHeight;
                _paneBottomH = frozenRowsHeight + _scrollDims.height;
            } else {
                _paneTopH = frozenRowsHeight;
                _paneBottomH = _viewportH - frozenRowsHeight;
            }
        } else {
            _paneTopH = _viewportH;
        }

        // The top pane includes the top panel, the header row and the footer row
        _paneTopH += _topPanelH + _headerRowH + _footerRowH;

        // The top viewport does not contain the top panel, the header row or the footer row
        _viewportTopH = _paneTopH - _topPanelH - _headerRowH - _footerRowH;

        if (_options.autoHeight) {
            _container.style.height = (_paneTopH + _groupingPanelH +
                parseFloat(getComputedStyle(_headerColsL.parentElement).height)) + 'px';
        }

        _paneTopL.style.top = (_groupingPanelH + (parseFloat(getComputedStyle(_paneHeaderL).height) || _headerRowH)) + "px";
        _paneTopL.style.height = _paneTopH + 'px';

        var paneBottomTop = _paneTopL.offsetTop + _paneTopH;

        if (_options.autoHeight) {
            _viewportTopL.style.height = '';
        }
        else {
            _viewportTopL.style.height = _viewportTopH + 'px'
        }

        if (frozenCols) {
            _paneTopR.style.top = _paneTopL.style.top;
            _paneTopR.style.height = _paneTopL.style.height;

            _viewportTopR.style.height = _viewportTopL.style.height;

            if (frozenRows) {
                _paneBottomL.style.top = _paneBottomR.style.top = paneBottomTop + 'px';
                _paneBottomL.style.height = _paneBottomR.style.height = _viewportBottomR.style.height = _paneBottomH + 'px';
            }
        } else {
            if (frozenRows) {
                _paneBottomL.style.width = '100%';
                _paneBottomL.style.height = _paneBottomH + 'px';
                _paneBottomL.style.top = paneBottomTop + 'px';
            }
        }

        if (frozenRows) {
            _viewportBottomL.style.height = _paneBottomH + 'px';
            const frozenRowsHeight = frozenRows * _options.rowHeight;
            if (_options.frozenBottom) {
                _canvasBottomL.style.height = frozenRowsHeight + 'px';

                if (frozenCols) {
                    _canvasBottomR.style.height = frozenRowsHeight + 'px';
                }
            } else {
                _canvasTopL.style.height = frozenRowsHeight + 'px';

                if (frozenCols) {
                    _canvasTopR.style.height = frozenRowsHeight + 'px';
                }
            }
        } else {
            _viewportTopR.style.height = _viewportTopH + 'px';
        }
    }

    function reorderViewColumns(viewCols: Column[]): Column[] {

        const options = host.getOptions();
        if (options?.frozenColumns == null) {
            delete options.frozenColumns;
        }
        else {
            var toFreeze = options.frozenColumns;
            options.frozenColumns = 0;
            var i = 0;
            while (i < viewCols.length) {
                var col = viewCols[i++];
                if (toFreeze > 0 && col.visible !== false) {
                    col.frozen = true;
                    options.frozenColumns++;
                    toFreeze--;
                }
                else if (col.frozen !== undefined)
                    delete col.frozen;
            }
        }

        var frozenColumns = viewCols.filter(x => x.frozen);
        if (frozenColumns.length)
            return frozenColumns.concat(viewCols.filter(x => !x.frozen));
    }

    function afterSetOptions(arg: GridOptions) {
        if (arg.frozenRows != null || arg.frozenBottom != null)
            adjustFrozenRowOption();
    }

    function adjustFrozenRowOption(): void {
        const options = host.getOptions();
        if (options.autoHeight) {
            frozenRows = 0;
            return;
        }

        frozenRows = (options.frozenRows > 0 && options.frozenRows <= host.getNumVisibleRows()) ? options.frozenRows : 0;

        if (frozenRows) {
            frozenBottom = options.frozenBottom;
            actualFrozenRow = options.frozenBottom ? (host.getDataLength() - frozenRows) : frozenRows;
        }
    }

    function getViewportHasHScroll(): boolean {
        return _viewportHasHScroll;
    }

    function getViewportHasVScroll(): boolean {
        return _viewportHasVScroll;
    }

    function getScrollCanvasY() {
        return frozenRows && !frozenBottom ? _canvasBottomL : _canvasTopL;
    }

    function canCleanupRow(i: number) {
        if (this.hasFrozenRows()
            && ((this._options.frozenBottom && i >= this._actualFrozenRow) // Frozen bottom rows
                || (!this._options.frozenBottom && i <= this._actualFrozenRow) // Frozen top rows
            )
        ) {
            return false;
        }

        return true;
    }

    function realScrollHeightChange(h: number) {
        if (frozenRows && !frozenBottom) {
            _canvasBottomL.style.height = h + 'px';

            if (frozenCols) {
                _canvasBottomR.style.height = h + 'px';
            }
        } else {
            _canvasTopL.style.height = h + 'px'
            _canvasTopR.style.height = h + 'px'
        }

    }

    return {
        afterHeaderColumnDrag,
        afterSetOptions,
        applyColumnWidths,
        bindAncestorScrollEvents,
        calcCanvasWidth,
        calcHeaderWidths,
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
        getScrollCanvasX,
        getScrollCanvasY,
        getScrollContainerX,
        getScrollContainerY,
        getViewportHasHScroll,
        getViewportHasVScroll,
        getViewportNodeFor,
        getViewportNodes,
        handleScrollH,
        handleScrollV,
        init,
        reorderViewColumns,
        setPaneVisibility,
        setScroller,
        setOverflow,
        updateCanvasWidth
    }
}