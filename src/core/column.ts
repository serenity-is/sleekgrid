import type { AsyncPostCleanup, AsyncPostRender, ColumnFormat, CompatFormatter } from "./formatting";
import { GroupTotals } from "./group";
import { EditorClass, ValidationResult } from "./editing";

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

export const columnDefaults: Partial<Column> = {
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
    columns?: { [key: string]: ColumnMetadata<TItem> };
    focusable?: boolean;
    format?: ColumnFormat<TItem>;
    /** @deprecated */
    formatter?: CompatFormatter<TItem>;
    selectable?: boolean;
}

export function initializeColumns(columns: Column[], defaults: Partial<Column<any>>) {
    var usedIds: { [key: string]: boolean } = {};

    for (var i = 0; i < columns.length; i++) {
        var m = columns[i];

        if (defaults != null) {
            for (var k in defaults) {
                if (m[k] === undefined)
                    m[k] = defaults[k];
            }
        }

        if (m.minWidth && m.width < m.minWidth)
            m.width = m.minWidth;

        if (m.maxWidth && m.width > m.maxWidth)
            m.width = m.maxWidth;

        if (m.id == null ||
            usedIds[m.id]) {
            const prefix = m.id != null && m.id.length ? m.id :
                m.field != null ? m.field : ('col');
            var x = 0;
            while (usedIds[(m.id = prefix + (x == 0 ? "" : '_' + x.toString()))]) x++;
        }

        usedIds[m.id] = true;

        if (m.name === void 0) {
            m.name = titleize(m.field ?? m.id);
            delete m.nameIsHtml;
        }
    }
}

export function titleize(str: string) {
    if (!str)
        return str;

    str = ("" + str).replace(/([A-Z]+)([A-Z][a-z])/, "$1_$2")
        .replace(/([a-z\d])([A-Z])/, "$1_$2")
        .replace(/[-\s]/, "_").toLowerCase();

    return str.replace(/\s/, '_').split('_').filter(x => x.length)
        .map(x => x.charAt(0).toUpperCase() + x.substring(1).toLowerCase()).join(' ');
}
