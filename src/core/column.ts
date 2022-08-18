import type { AsyncPostCleanup, AsyncPostRender, ColumnFormat, CompatFormatter } from "./formatting";
import { GroupTotals } from "./group";
import { Editor, ValidationResult } from "./editing";

export interface Column<TItem = any> {
    asyncPostRender?: AsyncPostRender<TItem>;
    asyncPostRenderCleanup?: AsyncPostCleanup<TItem>;
    behavior?: any;
    cannotTriggerInsert?: boolean;
    cssClass?: string;
    defaultSortAsc?: boolean;
    editor?: Editor;
    field: string;
    frozen?: boolean;
    focusable?: boolean;
    footerCssClass?: string;
    format?: ColumnFormat<TItem>;
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
    validator?: (value: any) => ValidationResult;
    visible?: boolean;
    width?: number;
}

export const columnDefaults: Partial<Column> = {
    name: "",
    nameIsHtml: false,
    resizable: true,
    sortable: false,
    minWidth: 30,
    rerenderOnResize: false,
    defaultSortAsc: true,
    focusable: true,
    selectable: true
};

export interface ColumnMetadata<TItem = any> {
    colspan: number | '*';
    format?: ColumnFormat<TItem>;
    formatter?: CompatFormatter<TItem>;
}

export interface ColumnSort {
    columnId: string;
    sortAsc?: boolean;
}

export interface ItemMetadata<TItem = any> {
    columns?: { [key: string]: ColumnMetadata<TItem> };
    format?: ColumnFormat<TItem>;
    formatter?: CompatFormatter<TItem>;
}

