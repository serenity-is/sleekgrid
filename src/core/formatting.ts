import type { Column } from "./column";
import { addClass, escapeHtml, removeClass } from "./util";

/**
 * Context object for column formatters. It provides access to the
 * current cell value, row index, column index, etc.
 * Use grid.getFormatterContext() to create a new instance.
 */
export interface FormatterContext<TItem = any> {

    /**
     * Additional attributes to be added to the cell node.
     */
    addAttrs?: { [key: string]: string; };

    /**
     * Additional classes to be added to the cell node.
     */
    addClass?: string;

    /**
     * Returns html escaped ctx.value if called without arguments.
     * prefer this over ctx.value to avoid html injection attacks!
     */
    escape(value?: any): string;

    /**
     * The row index of the cell.
     */
    row?: number;

    /**
     * The column index of the cell.
     */
    cell?: number;

    /**
     * The column definition of the cell.
     */
    column?: Column<TItem>;

    /**
     * The grid instance.
     */
    grid?: any;

    /**
     * The item of the row.
     */
    item?: TItem;

    /**
     * Tooltip text to be added to the cell node as title attribute.
     */
    tooltip?: string;

    /** when returning a formatter result, prefer ctx.escape() to avoid script injection attacks! */
    value?: any;
}

export type FormatterResult = (string | Element | DocumentFragment);
export type ColumnFormat<TItem = any> = (ctx: FormatterContext<TItem>) => FormatterResult;

export interface CompatFormatterResult {
    addClasses?: string;
    text?: FormatterResult;
    toolTip?: string;
}

export type CompatFormatter<TItem = any> = (row: number, cell: number, value: any, column: Column<TItem>, item: TItem, grid?: any) => string | CompatFormatterResult;

export interface FormatterFactory<TItem = any> {
    getFormat?(column: Column<TItem>): ColumnFormat<TItem>;
    getFormatter?(column: Column<TItem>): CompatFormatter<TItem>;
}

export type AsyncPostRender<TItem = any> = (cellNode: HTMLElement, row: number, item: TItem, column: Column<TItem>, reRender: boolean) => void;
export type AsyncPostCleanup<TItem = any> = (cellNode: HTMLElement, row?: number, column?: Column<TItem>) => void;

export type CellStylesHash = { [row: number]: { [columnId: string]: string } }

export function defaultColumnFormat(ctx: FormatterContext) {
    return escapeHtml(ctx.value);
}

export function convertCompatFormatter(compatFormatter: CompatFormatter): ColumnFormat {
    if (compatFormatter == null)
        return null;

    return function(ctx: FormatterContext): FormatterResult {
        var fmtResult = compatFormatter(ctx.row, ctx.cell, ctx.value, ctx.column, ctx.item, ctx.grid);
        if (fmtResult != null && typeof fmtResult !== 'string' && Object.prototype.toString.call(fmtResult) === '[object Object]') {
            ctx.addClass = fmtResult.addClasses;
            ctx.tooltip = fmtResult.toolTip;
            return fmtResult.text;
        }
        return fmtResult as string;
    }
}

export function applyFormatterResultToCellNode(ctx: FormatterContext, html: FormatterResult, node: HTMLElement) {
    var oldFmtAtt = node.dataset.fmtatt as string;
    if (oldFmtAtt?.length > 0) {
        for (var k of oldFmtAtt.split(','))
            node.removeAttribute(k);
        delete node.dataset.fmtatt;
    }

    var oldFmtCls = node.dataset.fmtcls;
    if (oldFmtCls?.length && (ctx.addClass != oldFmtCls)) {
        removeClass(node, oldFmtCls);
        if (!ctx.addClass?.length)
            delete node.dataset.fmtcls;
    }

    var oldTooltip = node.getAttribute('tooltip');
    if (oldTooltip != null && ctx.tooltip != oldTooltip)
        node.removeAttribute('tooltip');

    if (ctx.tooltip !== undefined && oldTooltip != ctx.tooltip)
        node.setAttribute('tooltip', ctx.tooltip);

    if (html == void 0)
        node.innerHTML = "";
    else if (html instanceof Node) {
        node.appendChild(html);
    }
    else
        node.innerHTML = "" + html;

    if (ctx.addAttrs != null) {
        var keys = Object.keys(ctx.addAttrs);
        if (keys.length) {
            for (var k of keys) {
                node.setAttribute(k, ctx.addAttrs[k]);
            }
            node.dataset.fmtatt = keys.join(',');
        }
    }

    if (ctx.addClass?.length) {
        addClass(node, ctx.addClass);
        node.dataset.fmtcls = ctx.addClass;
    }
}
