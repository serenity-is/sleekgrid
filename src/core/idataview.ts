import { ItemMetadata } from "./column";
import { EventEmitter } from "./event";
import { Group, IGroupTotals } from "./group";

export interface IDataView<TItem = any> {
    getGrandTotals(): IGroupTotals;
    getLength(): number;
    getItem(row: number): (TItem | Group<TItem> | IGroupTotals);
    getItemMetadata?(row: number): ItemMetadata<TItem>;
    onDataChanged?: EventEmitter;
    onRowCountChanged?: EventEmitter;
    onRowsChanged?: EventEmitter;
}
