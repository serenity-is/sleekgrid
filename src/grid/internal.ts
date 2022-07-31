import type { Column } from "./column";
import type { GridOptions } from "./gridoptions";

// shared across all grids on the page
let maxSupportedCssHeight: number;  // browser's breaking point
let scrollbarDimensions: { width: number, height: number };

export function adjustFrozenColumnCompat(columns: Column[], options: GridOptions) {
    if (options?.frozenColumns == null) {
        delete options.frozenColumns;
        return;
    }

    var toFreeze = options.frozenColumns;
    options.frozenColumns = 0;
    var i = 0;
    while (i < columns.length) {
        var col = columns[i++];
        if (toFreeze > 0 && col.visible !== false) {
            col.frozen = true;
            options.frozenColumns++;
            toFreeze--;
        }
        else if (col.frozen !== undefined)
            delete col.frozen;
    }
}

export function disableSelection(target: HTMLElement) {
    if (target) {
        target.setAttribute('unselectable', 'on');
        target.style.userSelect = "none";
        target.addEventListener('selectstart', () => false);
    }
}

export function getMaxSupportedCssHeight(): number {
    return maxSupportedCssHeight ?? ((navigator.userAgent.toLowerCase().match(/gecko\//) ? 4000000 : 32000000));
}

export function getScrollBarDimensions(recalc?: boolean) {
    if (!scrollbarDimensions || recalc) {
        var c = document.body.appendChild(H('div', {
            style: 'position:absolute;top:-10000px;left:-10000px;width:100px;height:100px;overflow: scroll;border:0'
        }));
        scrollbarDimensions = {
            width: Math.round(c.offsetWidth - c.clientWidth),
            height: Math.round(c.offsetWidth - c.clientHeight)
        };
        c.remove();
    }
    return scrollbarDimensions;
}

export function H<K extends keyof HTMLElementTagNameMap>(tag: K, attr?: { [key: string]: (string | boolean) }, ...children: Node[]): HTMLElementTagNameMap[K] {
    var el = document.createElement(tag);
    var k: string, v: (string | boolean), c: Node;
    if (attr) {
        for (k in attr) {
            v = attr[k];
            if (v != null && v !== false)
                el.setAttribute(k, v === true ? '' : v);
        }
    }
    if (children) {
        for (c of children)
            el.appendChild(c);
    }
    return el;
}

export function simpleArrayEquals(arr1: number[], arr2: number[]) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2) || arr1.length !== arr2.length)
        return false;
    arr1.sort();
    arr2.sort();
    for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i])
            return false;
    }
    return true;
}

/**
 * Helper to sort visible cols, while keeping invisible cols sticky to
 * the previous visible col. For example, if columns are currently in order
 * A, B, C, D, E, F, G, H and desired order is G, D, F (assuming A, B, C, E
 * were invisible) the result is A, B, G, H, D, E, F.
 */
 export function sortToDesiredOrderAndKeepRest(columns: Column[], idOrder: string[]): Column[] {
    if (idOrder.length == 0)
        return columns;

    var orderById: { [key: string]: number } = {},
        colIdxById: { [key: string]: number } = {},
        result: Column[] = [];

    for (var i = 0; i < idOrder.length; i++)
        orderById[idOrder[i]] = i;

    for (i = 0; i < columns.length; i++)
        colIdxById[columns[i].id] = i;

    function takeFrom(i: number) {
        for (var j = i; j < columns.length; j++) {
            var c = columns[j];
            if (i != j && orderById[c.id] != null)
                break;
            result.push(c);
            colIdxById[c.id] = null;
        }
    }

    if (orderById[columns[0].id] == null)
        takeFrom(0);

    for (var id of idOrder) {
        i = colIdxById[id];
        if (i != null)
            takeFrom(i);
    }

    for (i = 0; i < columns.length; i++) {
        var c = columns[i];
        if (colIdxById[c.id] != null) {
            result.push(c);
            colIdxById[c.id] = null;
        }
    }

    return result;
}

export function addUiStateHover() {
    (this as HTMLElement)?.classList?.add("ui-state-hover");
}

export function removeUiStateHover() {
    (this as HTMLElement)?.classList?.remove("ui-state-hover");
}

export interface CachedRow {
    rowNodeL: HTMLDivElement,
    rowNodeR: HTMLDivElement,
    // ColSpans of rendered cells (by column idx).
    // Can also be used for checking whether a cell has been rendered.
    cellColSpans: number[],

    // Cell nodes (by column idx).  Lazy-populated by ensureCellNodesInRowsCache().
    cellNodesByColumnIdx: { [key: number]: HTMLElement },

    // Column indices of cell nodes that have been rendered, but not yet indexed in
    // cellNodesByColumnIdx.  These are in the same order as cell nodes added at the
    // end of the row.
    cellRenderQueue: number[]
}

export interface GoToResult {
    row: number;
    cell: number;
    posX: number;
}

export interface PostProcessCleanupEntry {
    groupId: number,
    cellNode?: HTMLElement,
    columnIdx?: number,
    rowNodeL?: HTMLDivElement;
    rowNodeR?: HTMLDivElement;
    rowIdx?: number;
}
