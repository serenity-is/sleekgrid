import { addClass, htmlEncode, removeClass } from "../core/index";
import type { Column } from "./column";
import type { Grid } from "./grid";

export interface FormatterFactory<TItem = any> {
    getFormatter(column: Column<TItem>): ColumnFormatter<TItem>;
}

export interface FormatterResult {
    addClass?: string;
    addAttrs?: { [key: string]: string };
    html?: string;
    text?: string;
    toolTip?: string;
}

export type ColumnFormatter<TItem = any> = (row: number, cell: number, value: any, column: Column<TItem>, item: TItem, grid?: Grid<TItem>) => string | FormatterResult;
export type AsyncPostRender<TItem = any> = (cellNode: HTMLElement, row: number, item: TItem, column: Column<TItem>, reRender: boolean) => void;
export type AsyncPostCleanup<TItem = any> = (cellNode: HTMLElement, row?: number, column?: Column<TItem>) => void;

export type CellStylesHash = { [row: number]: { [cell: number]: string } }

export function defaultFormatter(_r: number, _c: number, value: any) {
    return htmlEncode(value);
}

export function applyFormatterResultToCellNode(fmtResult: FormatterResult | string, cellNode: HTMLElement) {

    var oldFmtAtt = cellNode.dataset?.fmtatt as string;
    if (oldFmtAtt?.length > 0) {
        for (var k of oldFmtAtt.split(','))
            cellNode.removeAttribute(k);
        delete cellNode.dataset.fmtatt;
    }

    const isFmtResult = fmtResult != null && typeof fmtResult !== 'string' && Object.prototype.toString.call(fmtResult) === '[object Object]';

    var oldFmtCls = cellNode.dataset?.fmtcls as string;
    if (oldFmtCls?.length && (!isFmtResult || fmtResult.addClass != oldFmtCls)) {
        removeClass(cellNode, oldFmtCls);
        if (!isFmtResult || !fmtResult.addClass.length)
            delete cellNode.dataset.fmtcls;
    }

    var oldToolTip = cellNode.getAttribute('tooltip');
    if (oldToolTip != null && (!isFmtResult || fmtResult.toolTip != oldToolTip))
        cellNode.removeAttribute('tooltip');

    if (isFmtResult && fmtResult.toolTip !== undefined && oldToolTip != fmtResult.toolTip)
        cellNode.setAttribute('tooltip', fmtResult.toolTip);

    if (fmtResult == null)
        cellNode.innerHTML = "";
    else if (!isFmtResult)
        cellNode.innerHTML = "" + fmtResult;
    else {
        if (fmtResult.html != null)
            cellNode.innerHTML = fmtResult.html;
        else
            cellNode.textContent = fmtResult.text ?? '';

        if (fmtResult.addAttrs != null) {
            var keys = Object.keys(fmtResult.addAttrs);
            if (keys.length) {
                for (var k of keys) {
                    cellNode.setAttribute(k, fmtResult.addAttrs[k]);
                }
                cellNode.dataset.fmtatt = keys.join(',');
            }
        }

        if (fmtResult.addClass?.length) {
            addClass(cellNode, fmtResult.addClass);
            cellNode.dataset.fmtcls = fmtResult.addClass;
        }
    }
}
