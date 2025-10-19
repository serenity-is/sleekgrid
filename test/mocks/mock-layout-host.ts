import { ViewportInfo, type Column, type RowCell } from "../../src/core";
import { GridOptions } from "../../src/core/gridoptions";
import type { GridOptionSignals } from "../../src/grid/layout";
import { mockSignal } from "./mock-signal";

export function mockLayoutHost() {
    const host = {
        container: document.createElement("div"),
        opt: {
            get showHeaderRow() { return host.optSignals.showHeaderRow.peek(); },
            set showHeaderRow(value: boolean) { host.optSignals.showHeaderRow.value = value; },
            get showFooterRow() { return host.optSignals.showFooterRow.peek(); },
            set showFooterRow(value: boolean) { host.optSignals.showFooterRow.value = value; },
            get showTopPanel() { return host.optSignals.showTopPanel.peek(); },
            set showTopPanel(value: boolean) { host.optSignals.showTopPanel.value = value; }
        } as GridOptions<any>,
        optSignals: {
            showHeaderRow: mockSignal(false),
            showFooterRow: mockSignal(false),
            showTopPanel: mockSignal(false)
        } satisfies GridOptionSignals,
        bindAncestorScroll: vi.fn(),
        cleanUpAndRenderCells: vi.fn(),
        getAvailableWidth: vi.fn(() => 1000),
        getCellFromPoint: vi.fn(() => ({ row: 0, cell: 0 } as RowCell)),
        getColumnCssRules: vi.fn(() => ({ right: '', left: '' })),
        getColumns: vi.fn(() => [] as Column[]),
        getInitialColumns: vi.fn(() => [] as Column[]),
        getContainerNode: vi.fn(() => host.container),
        getDataLength: vi.fn(() => 0),
        getOptions: vi.fn(() => host.opt),
        getOptionSignals: vi.fn(() => host.optSignals),
        getRowFromNode: vi.fn(() => null),
        getScrollDims: vi.fn(() => ({ width: 0, height: 0 })),
        getScrollLeft: vi.fn(() => 0),
        getScrollTop: vi.fn(() => 0),
        getViewportInfo: vi.fn(() => ({} as ViewportInfo)),
        renderRows: vi.fn()
    };
    return host;
}
