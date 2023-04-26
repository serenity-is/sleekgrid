import { Column, disableSelection, H, parsePx, spacerDiv } from "../core";
import { GridOptions, LayoutEngine, LayoutHost, ViewRange } from "../grid";

export const FrozenLayout: { new(): LayoutEngine } = function(): LayoutEngine {
    var canvasWidth: number;
    var canvasWidthL: number;
    var canvasWidthR: number;
    var frozenBottom: boolean;
    var frozenRowIdx: number;
    var frozenCols: number;
    var frozenRows: number;
    var headersWidthL: number;
    var headersWidthR: number;
    var viewportTopH: number;

    var canvasBottomL: HTMLDivElement;
    var canvasBottomR: HTMLDivElement;
    var canvasTopL: HTMLDivElement;
    var canvasTopR: HTMLDivElement;
    var headerColsL: HTMLDivElement;
    var headerColsR: HTMLDivElement;
    var headerRowColsL: HTMLDivElement;
    var headerRowColsR: HTMLDivElement;
    var headerRowSpacerL: HTMLDivElement;
    var headerRowSpacerR: HTMLDivElement;
    var footerRowColsL: HTMLDivElement;
    var footerRowColsR: HTMLDivElement;
    var footerRowSpacerL: HTMLDivElement;
    var footerRowSpacerR: HTMLDivElement;
    var paneBottomL: HTMLDivElement;
    var paneBottomR: HTMLDivElement;
    var paneHeaderL: HTMLDivElement;
    var paneHeaderR: HTMLDivElement;
    var paneTopL: HTMLDivElement;
    var paneTopR: HTMLDivElement;
    var scrollContainerX: HTMLDivElement;
    var scrollContainerY: HTMLDivElement;
    var topPanelL: HTMLDivElement;
    var topPanelR: HTMLDivElement;
    var viewportBottomL: HTMLDivElement;
    var viewportBottomR: HTMLDivElement;
    var viewportTopL: HTMLDivElement;
    var viewportTopR: HTMLDivElement;

    function appendCachedRow(row: number, rowNodeL: HTMLDivElement, rowNodeR: HTMLDivElement): void {
        var bottom = frozenRows && row >= frozenRowIdx + (frozenBottom ? 0 : 1);
        if (bottom) {
            rowNodeL && canvasBottomL.appendChild(rowNodeL);
            frozenCols && rowNodeR && canvasBottomR.appendChild(rowNodeR);
        }
        else {
            rowNodeL && canvasTopL.appendChild(rowNodeL);
            frozenCols && rowNodeR && canvasTopR.appendChild(rowNodeR);
        }
    }

    const calcCanvasWidth = () => {
        var cols = host.getColumns(), i = cols.length;

        canvasWidthL = canvasWidthR = 0;

        while (i--) {
            if (frozenCols > 0 && i >= frozenCols) {
                canvasWidthR += cols[i].width;
            } else {
                canvasWidthL += cols[i].width;
            }
        }

        var totalRowWidth = canvasWidthL + canvasWidthR;
        return host.getOptions().fullWidthRows ? Math.max(totalRowWidth, host.getAvailableWidth()) : totalRowWidth;
    }

    var host: LayoutHost;

    function init(hostGrid: LayoutHost) {
        host = hostGrid;
        const spacerW = calcCanvasWidth() + host.getScrollDims().width + 'px';
        const options = host.getOptions();
        const uisd = options.useLegacyUI ? ' ui-state-default' : '';

        // -- PANE HEADER LEFT
        headerColsL = H('div', { class: 'slick-header-columns slick-header-columns-left', style: (options.rtl ? "right" : "left") + ':-1000px' });
        paneHeaderL = H('div', { class: "slick-pane slick-pane-header slick-pane-left", tabIndex: '0' },
            H('div', { class: 'slick-header slick-header-left' + uisd, style: !options.showColumnHeader && 'display: none' }, headerColsL));

        // -- PANE HEADER RIGHT
        headerColsR = H('div', { class: 'slick-header-columns slick-header-columns-right', style: (options.rtl ? "right" : "left") + ':-1000px' });
        paneHeaderR = H('div', { class: "slick-pane slick-pane-header slick-pane-right", tabIndex: '0' },
            H('div', { class: 'slick-header slick-header-right' + uisd, style: !options.showColumnHeader && 'display: none' }, headerColsR));

        // -- PANE TOP LEFT (headerrow left + top panel left + viewport top left + footer row right)
        headerRowColsL = H('div', { class: 'slick-headerrow-columns slick-headerrow-columns-left' });
        headerRowSpacerL = spacerDiv(spacerW);
        var headerRowL = H('div', { class: 'slick-headerrow' + uisd, style: !options.showHeaderRow && 'display: none' }, headerRowColsL, headerRowSpacerL);

        topPanelL = H('div', { class: 'slick-top-panel', style: 'width: 10000px' })
        var topPanelLS = H('div', { class: 'slick-top-panel-scroller' + uisd, style: !options.showTopPanel && 'display: none' }, topPanelL);

        canvasTopL = H('div', { class: "grid-canvas grid-canvas-top grid-canvas-left", tabIndex: "0", hideFocus: '' });
        viewportTopL = H('div', { class: "slick-viewport slick-viewport-top slick-viewport-left", tabIndex: "0", hideFocus: '' }, canvasTopL);

        footerRowColsL = H('div', { class: 'slick-footerrow-columns slick-footerrow-columns-left' });
        footerRowSpacerL = spacerDiv(spacerW);
        var footerRowL = H('div', { class: 'slick-footerrow' + uisd, style: !options.showFooterRow && 'display: none' }, footerRowColsL, footerRowSpacerL);

        paneTopL = H('div', { class: "slick-pane slick-pane-top slick-pane-left", tabIndex: "0" }, headerRowL, topPanelLS, viewportTopL, footerRowL);

        // -- PANE TOP RIGHT (headerrow right + top panel right + viewport top right + footer row right)
        headerRowColsR = H('div', { class: 'slick-headerrow-columns slick-headerrow-columns-right' });
        headerRowSpacerR = spacerDiv(spacerW);
        var headerRowR = H('div', { class: 'slick-headerrow' + uisd, style: !options.showHeaderRow && 'display: none' }, headerRowColsR, headerRowSpacerR);

        topPanelR = H('div', { class: 'slick-top-panel', style: 'width: 10000px' });
        var topPanelRS = H('div', { class: 'slick-top-panel-scroller' + uisd, style: !options.showTopPanel && 'display: none' }, topPanelR);

        canvasTopR = H('div', { class: "grid-canvas grid-canvas-top grid-canvas-right", tabIndex: "0", hideFocus: '' })
        viewportTopR = H('div', { class: "slick-viewport slick-viewport-top slick-viewport-right", tabIndex: "0", hideFocus: '' }, canvasTopR);

        footerRowColsR = H('div', { class: 'slick-footerrow-columns slick-footerrow-columns-right' });
        footerRowSpacerR = H('div', { style: 'display:block;height:1px;position:absolute;top:0;left:0;', width: spacerW });
        var footerRowR = H('div', { class: 'slick-footer-row' + uisd, style: !options.showFooterRow && 'display: none' }, footerRowColsR, footerRowSpacerR);

        paneTopR = H('div', { class: "slick-pane slick-pane-top slick-pane-right", tabIndex: "0" }, headerRowR, topPanelRS, viewportTopR, footerRowR);

        // -- PANE BOTTOM LEFT
        canvasBottomL = H('div', { class: "grid-canvas grid-canvas-bottom grid-canvas-left", tabIndex: "0", hideFocus: '' });
        viewportBottomL = H('div', { class: "slick-viewport slick-viewport-bottom slick-viewport-left", tabIndex: "0", hideFocus: '' }, canvasBottomL);
        paneBottomL = H('div', { class: "slick-pane slick-pane-bottom slick-pane-left", tabIndex: "0" }, viewportBottomL);

        canvasBottomR = H('div', { class: "grid-canvas grid-canvas-bottom grid-canvas-right", tabIndex: "0", hideFocus: '' });
        viewportBottomR = H('div', { class: "slick-viewport slick-viewport-bottom slick-viewport-right", tabIndex: "0", hideFocus: '' });
        paneBottomR = H('div', { class: "slick-pane slick-pane-bottom slick-pane-right", tabIndex: "0" }, viewportBottomR);

        host.getContainerNode().append(
            paneHeaderL,
            paneHeaderR,
            paneTopL,
            paneTopR,
            paneBottomL,
            paneBottomR);

        // disable all text selection in header (including input and textarea)
        disableSelection(headerColsL);
        disableSelection(headerColsR);

        adjustFrozenRowOption();
    }

    function getHeaderCols() {
        return [headerColsL, headerColsR];
    }

    function getHeaderRowCols() {
        return [headerRowColsL, headerRowColsR];
    }

    function getFooterRowCols() {
        return [footerRowColsL, footerRowColsR];
    }

    const getCanvasNodeFor = (cell: number, row: number) => {
        if (row == null && cell == null)
            return canvasTopL;

        var rightSide = cell >= frozenCols;

        if (frozenRows > 0 && (row >= frozenRowIdx + (frozenBottom ? 0 : 1)))
            return rightSide ? canvasBottomR : canvasBottomL;

        return rightSide ? canvasTopR : canvasTopL;
    }

    function getCanvasWidth() {
        return canvasWidth;
    }

    function getCanvasNodes() {
        return [canvasTopL, canvasTopR, canvasBottomL, canvasBottomR];
    }

    function getScrollContainerX() {
        return scrollContainerX;
    }

    function getScrollContainerY() {
        return scrollContainerY;
    }

    function getViewportNodeFor(cell: number, row: number) {
        if (row == null && cell == null)
            return canvasTopL;

        var rightSide = cell >= frozenCols;

        if (frozenRows > 0 && (row >= frozenRowIdx + (frozenBottom ? 0 : 1)))
            return rightSide ? canvasBottomR : canvasBottomL;

        return rightSide ? canvasTopR : canvasTopL;
    }

    function getViewportNodes() {
        return [viewportTopL, viewportTopR, viewportBottomL, viewportBottomR];
    }

    const updateCanvasWidth = () => {
        var oldCanvasWidth = canvasWidth;
        var oldCanvasWidthL = canvasWidthL;
        var oldCanvasWidthR = canvasWidthR;
        var widthChanged;
        canvasWidth = calcCanvasWidth();
        var scrollWidth = host.getScrollDims().width;

        widthChanged = canvasWidth !== oldCanvasWidth || canvasWidthL !== oldCanvasWidthL || canvasWidthR !== oldCanvasWidthR;
        var vpi = host.getViewportInfo();

        if (widthChanged || frozenCols || frozenRows) {
            var cwlPX = canvasWidthL + 'px'
            var cwrPX = canvasWidthR + 'px';

            canvasTopL.style.width = cwlPX;

            calcHeaderWidths();

            if (frozenCols) {
                var vpminusPX = (vpi.width - canvasWidthL) + 'px';
                const rtl = host.getOptions().rtl;

                canvasTopR.style.width = cwrPX;
                paneHeaderL.style.width = cwlPX;
                paneHeaderR.style[rtl ? "right" : "left"] = cwlPX;
                paneHeaderR.style.width = vpminusPX;

                paneTopL.style.width = cwlPX;
                paneTopR.style[rtl ? "right" : "left"] = cwlPX;
                paneTopR.style.width = vpminusPX;

                headerRowColsL.style.width = cwlPX;
                headerRowColsL.parentElement.style.width = cwlPX;
                headerRowColsR.style.width = cwrPX;
                headerRowColsR.parentElement.style.width = vpminusPX;

                footerRowColsL.style.width = cwlPX;
                footerRowColsL.parentElement.style.width = cwlPX;
                footerRowColsR.style.width = cwrPX;
                footerRowColsR.parentElement.style.width = vpminusPX;

                viewportTopL.style.width = cwlPX;
                viewportTopR.style.width = vpminusPX;

                if (frozenRows) {
                    paneBottomL.style.width = cwlPX;
                    paneBottomR.style[rtl ? "right" : "left"] = cwlPX;

                    viewportBottomL.style.width = cwlPX;
                    viewportBottomR.style.width = vpminusPX;

                    canvasBottomL.style.width = cwlPX;
                    canvasBottomR.style.width = cwrPX;
                }
            } else {
                paneHeaderL.style.width = '100%';
                paneTopL.style.width = '100%';
                headerRowColsL.parentElement.style.width = '100%';
                headerRowColsL.style.width = canvasWidth + 'px';
                footerRowColsL.parentElement.style.width = '100%';
                footerRowColsL.style.width = canvasWidth + 'px';
                viewportTopL.style.width = '100%';

                if (frozenRows) {
                    viewportBottomL.style.width = '100%';
                    canvasBottomL.style.width = cwlPX;
                }
            }

            vpi.hasHScroll = (canvasWidth > vpi.width - scrollWidth);
        }

        var w = (canvasWidth + (vpi.hasHScroll ? scrollWidth : 0)) + 'px';

        headerRowSpacerL.style.width = w;
        headerRowSpacerR.style.width = w;
        footerRowSpacerL.style.width = w;
        footerRowSpacerR.style.width = w;

        return widthChanged;
    }

    const getHeaderColumn = (cell: number) => {
        return (frozenCols > 0 && cell >= frozenCols ?
            headerColsR.children.item(cell - frozenCols) : headerColsL.children.item(cell)) as HTMLDivElement;
    }

    const getHeaderRowColumn = (cell: number) => {
        var target: HTMLDivElement;

        if (frozenCols <= 0 || cell < frozenCols) {
            target = headerRowColsL;
        }
        else {
            target = headerRowColsR;
            cell -= frozenCols;
        }

        return target.childNodes.item(cell) as HTMLDivElement;
    }

    const getFooterRowColumn = (cell: number) => {
        var target: HTMLDivElement;

        if (frozenCols <= 0 || cell < frozenCols) {
            target = footerRowColsL;
        }
        else {
            target = footerRowColsR;
            cell -= frozenCols;
        }

        return target.childNodes.item(cell) as HTMLDivElement;
    }

    const getHeaderRowColsFor = (cell: number) => {
        return frozenCols > 0 && cell >= frozenCols ? headerRowColsR : headerRowColsL;
    }

    const getFooterRowColsFor = (cell: number) => {
        return frozenCols > 0 && cell >= frozenCols ? footerRowColsR : footerRowColsL;
    }

    const calcHeaderWidths = () => {
        headersWidthL = headersWidthR = 0;

        var scrollWidth = host.getScrollDims().width;
        var cols = host.getColumns();
        for (var i = 0, ii = cols.length; i < ii; i++) {
            var width = cols[i].width;

            if (frozenCols > 0 && i >= frozenCols) {
                headersWidthR += width;
            } else {
                headersWidthL += width;
            }
        }

        const vs = host.getViewportInfo();

        if (frozenCols > 0) {
            headersWidthL = headersWidthL + 1000;
            headersWidthR = Math.max(headersWidthR, vs.width) + headersWidthL;
            headersWidthR += scrollWidth;
        } else {
            headersWidthL += scrollWidth;
            headersWidthL = Math.max(headersWidthL, vs.width) + 1000;
        }

        headerColsL.style.width = headersWidthL + 'px';
        headerColsR.style.width = headersWidthR + 'px';
    }

    const getHeaderColsFor = (cell: number) => {
        return frozenCols > 0 && cell >= frozenCols ? headerColsR : headerColsL;
    }

    const handleScrollH = () => {
        const options = host.getOptions();
        const scrollLeft = host.getScrollLeft();
        if (frozenCols) {
            options.showColumnHeader && (headerColsR.parentElement.scrollLeft = scrollLeft);
            options.showTopPanel && (topPanelR.parentElement.scrollLeft = scrollLeft);
            options.showHeaderRow && (headerRowColsR.parentElement.scrollLeft = scrollLeft);
            options.showFooterRow && (footerRowColsR.parentElement.scrollLeft = scrollLeft);
            if (frozenRows) {
                viewportTopR.scrollLeft = scrollLeft;
            }
        } else {
            options.showColumnHeader && (headerColsL.parentElement.scrollLeft = scrollLeft);
            options.showTopPanel && (topPanelL.parentElement.scrollLeft = scrollLeft);
            options.showHeaderRow && (headerRowColsL.parentElement.scrollLeft = scrollLeft);
            options.showFooterRow && (footerRowColsL.parentElement.scrollLeft = scrollLeft);
            if (frozenRows) {
                viewportTopL.scrollLeft = scrollLeft;
            }
        }
    }

    const handleScrollV = () => {
        if (frozenCols) {
            if (frozenRows && !frozenBottom) {
                viewportBottomL.scrollTop = host.getScrollTop();
            } else {
                viewportTopL.scrollTop = host.getScrollTop();
            }
        }
    }

    const setScroller = () => {
        if (frozenCols) {
            if (frozenRows) {
                if (frozenBottom) {
                    scrollContainerX = viewportBottomR;
                    scrollContainerY = viewportTopR;
                } else {
                    scrollContainerX = scrollContainerY = viewportBottomR;
                }
            } else {
                scrollContainerX = scrollContainerY = viewportTopR;
            }
        } else {
            if (frozenRows) {
                if (frozenBottom) {
                    scrollContainerX = viewportBottomL;
                    scrollContainerY = viewportTopL;
                } else {
                    scrollContainerX = scrollContainerY = viewportBottomL;
                }
            } else {
                scrollContainerX = scrollContainerY = viewportTopL;
            }
        }
    }

    const setPaneVisibility = () => {
        paneHeaderR.style.display = paneTopR.style.display = frozenCols ? '' : 'none';
        paneBottomL.style.display = frozenRows ? '' : 'none';
        paneBottomR.style.display = frozenRows && frozenCols ? '' : 'none';
    }

    const setOverflow = () => {
        const options = host.getOptions();
        var alwaysHS = options.alwaysAllowHorizontalScroll;
        var alwaysVS = options.alwaysShowVerticalScroll;

        viewportTopL.style.overflowX = viewportTopR.style.overflowX = (frozenRows && !alwaysHS) ? 'hidden' : (frozenCols ? 'scroll' : 'auto');
        viewportTopL.style.overflowY = viewportBottomL.style.overflowY = (!frozenCols && alwaysVS) ? 'scroll' :
            (frozenCols ? 'hidden' : (frozenRows ? 'scroll' : (options.autoHeight ? 'hidden' : 'auto')));
        viewportTopR.style.overflowY = (alwaysVS || frozenRows) ? 'scroll' : (options.autoHeight ? 'hidden' : 'auto');
        viewportBottomL.style.overflowX = viewportBottomR.style.overflowX = (frozenCols && !alwaysHS) ? 'scroll' : 'auto';
        viewportBottomR.style.overflowY = (alwaysVS) ? 'scroll' : 'auto';
    }

    const bindAncestorScrollEvents = () => {
        var elem: HTMLElement = (frozenRows && !frozenBottom) ? canvasBottomL : canvasTopL;
        while ((elem = elem.parentNode as HTMLElement) != document.body && elem != null) {
            // bind to scroll containers only
            if (elem == viewportTopL || elem.scrollWidth != elem.clientWidth || elem.scrollHeight != elem.clientHeight) {
                host.bindAncestorScroll(elem);
            }
        }
    }

    const afterHeaderColumnDrag = () => {
        const oldCanvasWidthL = canvasWidthL;
        canvasWidth = calcCanvasWidth();
        if (frozenCols &&  canvasWidthL != oldCanvasWidthL) {
            headerColsL.style.width = canvasWidthL + 1000 + 'px';
            paneHeaderR.style[host.getOptions().rtl ? 'right' : 'left'] = canvasWidthL + 'px';
        }
    }

    const applyColumnWidths = () => {
        var x = 0, w, rule, cols = host.getColumns(), opts = host.getOptions(), rtl = opts.rtl,
            s = rtl ? 'right' : 'left',
            e = rtl ? 'left' : 'right';

        if (opts.useCssVars) {
            var styles = host.getContainerNode().style;
            for (var i = 0; i < cols.length; i++) {
                if (frozenCols == i)
                    x = 0;
                w = cols[i].width;
                var prop = "--l" + i;
                var oldVal = styles.getPropertyValue(prop);
                var newVal = x + "px";
                if (oldVal !== newVal) 
                    styles.setProperty(prop, newVal);
                prop = "--r" + i;
                oldVal = styles.getPropertyValue(prop);
                newVal = (((frozenCols > 0 && i >= frozenCols) ? canvasWidthR : canvasWidthL) - x - w) + "px"
                if (oldVal !== newVal) 
                    styles.setProperty(prop, newVal);
                x += w;
            }
        }
        else {
            for (var i = 0; i < cols.length; i++) {
                if (frozenCols == i)
                    x = 0;
                w = cols[i].width;
                rule = host.getColumnCssRules(i);
                (rule as any)[s].style[s] = x + "px";
                (rule as any)[e].style[e] = (((frozenCols > 0 && i >= frozenCols) ? canvasWidthR : canvasWidthL) - x - w) + "px";
                x += w;
            }
        }
    }

    const getTopPanelFor = (cell: number) => {
        return frozenCols > 0 && cell >= frozenCols ? topPanelR : topPanelL;
    }

    const getTopPanelNodes = () => [topPanelL, topPanelR];

    const resizeCanvas = () => {
        var _paneTopH = 0
        var _paneBottomH = 0
        const vs = host.getViewportInfo();
        const options = host.getOptions();

        // Account for Frozen Rows
        if (frozenRows) {
            const frozenRowsHeight = frozenRows * options.rowHeight;
            if (frozenBottom) {
                _paneTopH = vs.height - frozenRowsHeight;
                _paneBottomH = frozenRowsHeight + host.getScrollDims().height;
            } else {
                _paneTopH = frozenRowsHeight;
                _paneBottomH = vs.height - frozenRowsHeight;
            }
        } else {
            _paneTopH = vs.height;
        }

        // The top pane includes the top panel, the header row and the footer row
        _paneTopH += vs.topPanelHeight + vs.headerRowHeight + vs.footerRowHeight;

        // The top viewport does not contain the top panel, the header row or the footer row
        viewportTopH = _paneTopH - vs.topPanelHeight - vs.headerRowHeight - vs.footerRowHeight;

        if (options.autoHeight) {
            host.getContainerNode().style.height = (_paneTopH + vs.groupingPanelHeight +
                parsePx(getComputedStyle(headerColsL.parentElement).height)) + 'px';
        }

        paneTopL.style.top = (vs.groupingPanelHeight + (parsePx(getComputedStyle(paneHeaderL).height) || vs.headerHeight)) + "px";
        paneTopL.style.height = _paneTopH + 'px';

        var paneBottomTop = paneTopL.offsetTop + _paneTopH;

        if (options.autoHeight) {
            viewportTopL.style.height = '';
        }
        else {
            viewportTopL.style.height = viewportTopH + 'px'
        }

        if (frozenCols) {
            paneTopR.style.top = paneTopL.style.top;
            paneTopR.style.height = paneTopL.style.height;

            viewportTopR.style.height = viewportTopL.style.height;

            if (frozenRows) {
                paneBottomL.style.top = paneBottomR.style.top = paneBottomTop + 'px';
                paneBottomL.style.height = paneBottomR.style.height = viewportBottomR.style.height = _paneBottomH + 'px';
            }
        } else {
            if (frozenRows) {
                paneBottomL.style.width = '100%';
                paneBottomL.style.height = _paneBottomH + 'px';
                paneBottomL.style.top = paneBottomTop + 'px';
            }
        }

        if (frozenRows) {
            viewportBottomL.style.height = _paneBottomH + 'px';
            const frozenRowsHeight = frozenRows * options.rowHeight;
            if (frozenBottom) {
                canvasBottomL.style.height = frozenRowsHeight + 'px';

                if (frozenCols) {
                    canvasBottomR.style.height = frozenRowsHeight + 'px';
                }
            } else {
                canvasTopL.style.height = frozenRowsHeight + 'px';

                if (frozenCols) {
                    canvasTopR.style.height = frozenRowsHeight + 'px';
                }
            }
        } else {
            viewportTopR.style.height = viewportTopH + 'px';
        }
    }

    function reorderViewColumns(viewCols: Column[], options?: GridOptions): Column[] {

        options = options || host?.getOptions();
        if (options?.frozenColumns == null) {
            delete options?.frozenColumns;
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
        frozenCols = frozenColumns.length;
        if (frozenCols)
            return frozenColumns.concat(viewCols.filter(x => !x.frozen));

        return viewCols;
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

        frozenRows = (options.frozenRows > 0 && options.frozenRows <= host.getViewportInfo().numVisibleRows) ? options.frozenRows : 0;

        if (frozenRows) {
            frozenRowIdx = options.frozenBottom ? (host.getDataLength() - frozenRows) : (frozenRows - 1);
        }
    }

    function getScrollCanvasY() {
        return frozenRows && !frozenBottom ? canvasBottomL : canvasTopL;
    }

    function realScrollHeightChange() {
        const h = host.getViewportInfo().realScrollHeight;
        if (frozenRows && !frozenBottom) {
            canvasBottomL.style.height = h + 'px';

            if (frozenCols) {
                canvasBottomR.style.height = h + 'px';
            }
        } else {
            canvasTopL.style.height = h + 'px'
            canvasTopR.style.height = h + 'px'
        }
    }

    function isFrozenRow(row: number) {
        return frozenRows && ((frozenBottom && row >= frozenRowIdx) || (!frozenBottom && row <= frozenRowIdx));
    }

    function beforeCleanupAndRenderCells(rendered: ViewRange) {
        if (frozenRows) {

            var renderedFrozenRows = Object.assign({}, rendered);

            if (frozenBottom) {
                renderedFrozenRows.top = frozenRowIdx;
                renderedFrozenRows.bottom = host.getDataLength() - 1;
            }
            else {

                renderedFrozenRows.top = 0;
                renderedFrozenRows.bottom = frozenRowIdx;
            }

            host.cleanUpAndRenderCells(renderedFrozenRows);
        }
    }

    function afterRenderRows(rendered: ViewRange) {
        // Render frozen rows
        if (frozenRows) {
            if (frozenBottom) {
                host.renderRows({
                    top: frozenRowIdx,
                    bottom: host.getDataLength() - 1,
                    leftPx: rendered.leftPx,
                    rightPx: rendered.rightPx
                });
            }
            else {
                host.renderRows({
                    top: 0,
                    bottom: frozenRowIdx,
                    leftPx: rendered.leftPx,
                    rightPx: rendered.rightPx
                });
            }
        }
    }

    function getRowOffset(row: number): number {
        if (!frozenRows || (frozenBottom && row < frozenRowIdx) || (!frozenBottom && row <= frozenRowIdx))
            return 0;

        if (!frozenBottom)
            return frozenRows * host.getOptions().rowHeight;

        var realScrollHeight = host.getViewportInfo().realScrollHeight;
        if (realScrollHeight >= viewportTopH)
            return realScrollHeight;

        return frozenRowIdx * host.getOptions().rowHeight;
    }

    function getRowFromCellNode(cellNode: HTMLElement, clientX: number, clientY: number): number {
        var row = host.getRowFromNode(cellNode.parentNode as HTMLElement);

        if (frozenRows) {

            var bcr = cellNode.closest('.grid-canvas').getBoundingClientRect();

            var rowOffset = 0;
            var isBottom = cellNode.closest('.grid-canvas-bottom') != null;

            if (isBottom) {
                rowOffset = frozenBottom ? Math.round(parsePx(getComputedStyle(canvasTopL).height)) : (frozenRows * host.getOptions().rowHeight);
            }

            return host.getCellFromPoint(clientX - bcr[host.getOptions().rtl ? 'right' : 'left'] - document.body.scrollLeft, clientY - bcr.top + document.body.scrollTop + rowOffset + document.body.scrollTop).row;
        }

        return row;
    }

    function getFrozenCols() {
        return frozenCols;
    }

    function getFrozenRows() {
        return frozenRows;
    }

    function destroy(): void {
        host = null;
    }

    return {
        afterHeaderColumnDrag,
        afterRenderRows,
        afterSetOptions,
        appendCachedRow,
        applyColumnWidths,
        bindAncestorScrollEvents,
        beforeCleanupAndRenderCells,
        calcCanvasWidth,
        updateHeadersWidth: calcHeaderWidths,
        isFrozenRow,
        destroy,
        getCanvasNodeFor,
        getCanvasNodes,
        getCanvasWidth,
        getFooterRowCols,
        getFooterRowColsFor,
        getFooterRowColumn,
        getFrozenCols,
        getFrozenRows,
        getHeaderCols,
        getHeaderColsFor,
        getHeaderColumn,
        getHeaderRowCols,
        getHeaderRowColsFor,
        getHeaderRowColumn,
        getRowFromCellNode,
        getFrozenRowOffset: getRowOffset,
        getScrollCanvasY,
        getScrollContainerX,
        getScrollContainerY,
        getTopPanelFor,
        getTopPanelNodes,
        getViewportNodeFor,
        getViewportNodes,
        handleScrollH,
        handleScrollV,
        init,
        layoutName: "frozen",
        realScrollHeightChange,
        reorderViewColumns,
        resizeCanvas,
        setPaneVisibility,
        setScroller,
        setOverflow,
        updateCanvasWidth
    }
} as any;
