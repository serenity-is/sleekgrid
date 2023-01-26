import { addClass, escape, removeClass } from "./util";
import type { Column } from "./column";

export interface FormatterContext<TItem = any> {
    addAttrs?: { [key: string]: string; };
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

export type CellStylesHash = { [row: number]: { [columnId: string]: string } }

export function defaultColumnFormat(ctx: FormatterContext) {
    return escape(ctx.value);
}

export function convertCompatFormatter(compatFormatter: CompatFormatter): ColumnFormat {
    if (compatFormatter == null)
        return null;

    return function(ctx: FormatterContext): string {
        var fmtResult = compatFormatter(ctx.row, ctx.cell, ctx.value, ctx.column, ctx.item, ctx.grid);
        if (fmtResult != null && typeof fmtResult !== 'string' && Object.prototype.toString.call(fmtResult) === '[object Object]') {
            ctx.addClass = fmtResult.addClasses;
            ctx.tooltip = fmtResult.toolTip;
            return fmtResult.text;
        }
        return fmtResult as string;
    }
}

export function applyFormatterResultToCellNode(ctx: FormatterContext, html: string, node: HTMLElement) {
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
