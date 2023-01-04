import { Grid } from "@/grid";
import { Column } from "@/core";

const getTestColumns = (): Column[] => ([{
    id: 'test_id',
    field: 'test_field',
    name: 'test_name',
}, {
    id: 'test2_id',
    field: 'test2_field',
    name: 'test2_name',
}]);

describe('updateColumnHeader', () => {
    it('should be able to update column header', () => {
        const columns = getTestColumns();
        const grid = new Grid(document.createElement('div'), [], columns, {});

        grid.updateColumnHeader(columns[0].id, 'abc', 'def');

        expect(columns[0].name).toBe('abc');
        expect(columns[0].toolTip).toBe('def');
        expect(grid.getHeaderColumn(columns[0].id).title).toBe('def');
    });

    it('should trigger onBeforeHeaderCellDestroy event before update', () => {
        const columns = getTestColumns();
        columns[0].toolTip = 'test';

        const grid = new Grid(document.createElement('div'), [], columns, {});

        let onBeforeHeaderCellDestroyCalled = false;
        grid.onBeforeHeaderCellDestroy.subscribe((eventData, args) => {
            onBeforeHeaderCellDestroyCalled = true;

            expect(args.column).toBe(columns[0]);
            expect(args.node).toBe(grid.getHeaderColumn(columns[0].id));

            expect(grid.getHeaderColumn(columns[0].id).title).toBe('test');
        });

        grid.updateColumnHeader(columns[0].id, 'abc', 'def');

        expect(onBeforeHeaderCellDestroyCalled).toBe(true);
    });

    it('should trigger onHeaderCellRendered event after update', () => {
        const columns = getTestColumns();
        const grid = new Grid(document.createElement('div'), [], columns, {});

        let onHeaderCellRenderedCalled = false;
        grid.onHeaderCellRendered.subscribe((eventData, args) => {
            onHeaderCellRenderedCalled = true;

            expect(args.column).toBe(columns[0]);
            expect(args.node).toBe(grid.getHeaderColumn(columns[0].id));

            expect(grid.getHeaderColumn(columns[0].id).title).toBe('def');
        });

        grid.updateColumnHeader(columns[0].id, 'abc', 'def');

        expect(onHeaderCellRenderedCalled).toBe(true);
    });

    it('should update innerHTML when column.nameIsHtml is truthy', () => {
        const columns = getTestColumns();
        columns[0].nameIsHtml = true;
        const grid = new Grid(document.createElement('div'), [], columns, {});

        grid.updateColumnHeader(columns[0].id, `<i><span id="test">abc</span></i>`, 'def');

        expect(grid.getHeaderColumn(columns[0].id).querySelector("#test").innerHTML).toBe('abc');
    });

    it('should update textContent when column.nameIsHtml is falsy', () => {
        const columns = getTestColumns();
        columns[0].nameIsHtml = false;
        const grid = new Grid(document.createElement('div'), [], columns, {});

        grid.updateColumnHeader(columns[0].id, `<i><span id="test">abc</span></i>`, 'def');

        expect(grid.getHeaderColumn(columns[0].id).querySelector("#test")).toBeNull();
    });

    it('should not update column header if grid is not initialized', () => {
        const columns = getTestColumns();
        const grid = new Grid(document.createElement('div'), [], columns, {
            explicitInitialization: true
        });

        grid.updateColumnHeader(columns[0].id, 'foo', 'foo');

        expect(columns[0].name).not.toBe('foo');
        expect(columns[0].toolTip).not.toBe('foo');
        expect(grid.getHeaderColumn(columns[0].id)?.title).not.toBe('foo');
    });
});
