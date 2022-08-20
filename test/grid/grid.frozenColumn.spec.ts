import { Column } from "@/core/column";
import { Grid } from "@/grid/grid";
import { FrozenLayout } from "@/layouts/frozenlayout";

const slickPaneRight = "slick-pane-right";
const slickPaneLeft = "slick-pane-left";
const slickPaneTop = "slick-pane-top";
const slickPaneBottom = "slick-pane-bottom";

function threeCols(): Column[] {
    return [{
        id: 'c1',
        field: 'c1'
    }, {
        id: 'c2',
        field: 'c2'
    }, {
        id: 'c3',
        field: 'c3'
    }]
}

function container() {
    return document.body.appendChild(document.createElement('div'));
}

describe('options.frozenColumns', () => {

    it('is ignored when undefined', () => {
        const grid = new Grid(container(), [], threeCols(), {
            enableColumnReorder: false,
            layoutEngine: new FrozenLayout()
        });

        expect(grid.getInitialColumns().length).toBe(3);
        expect(grid.getColumns().length).toBe(3);
        expect(grid.getColumns()[0].frozen).toBeUndefined();
    });

    it('is ignored when null', () => {
        const grid = new Grid(container(), [], threeCols(), {
            enableColumnReorder: false,
            frozenColumns: null,
            layoutEngine: new FrozenLayout()
        });

        expect(grid.getInitialColumns().length).toBe(3);
        expect(grid.getColumns().length).toBe(3);
        expect(grid.getColumns()[0].frozen).toBeUndefined();
    });

    it('is ignored when less than zero', () => {
        const grid = new Grid(container(), [], threeCols(), {
            enableColumnReorder: false,
            frozenColumns: -1,
            layoutEngine: new FrozenLayout()
        });

        expect(grid.getInitialColumns().length).toBe(3);
        expect(grid.getColumns().length).toBe(3);
        expect(grid.getColumns()[0].frozen).toBeUndefined();
    });

    it('is ignored when than zero', () => {
        const grid = new Grid(container(), [], threeCols(), {
            enableColumnReorder: false,
            frozenColumns: 0,
            layoutEngine: new FrozenLayout()
        });

        expect(grid.getInitialColumns().length).toBe(3);
        expect(grid.getColumns().length).toBe(3);
        expect(grid.getColumns()[0].frozen).toBeUndefined();
    });

    it('sets first column to frozen when 1 and all cols are visible', () => {
        const grid = new Grid(container(), [], threeCols(), {
            enableColumnReorder: false,
            frozenColumns: 1,
            layoutEngine: new FrozenLayout()
        });

        expect(grid.getInitialColumns().length).toBe(3);
        expect(grid.getColumns().length).toBe(3);
        expect(grid.getColumns()[0].frozen).toBe(true);
    });

    it('sets the first visible column to frozen when 1', () => {
        var cols = threeCols();
        cols[0].visible = false;
        const grid = new Grid(container(), [], cols , {
            enableColumnReorder: false,
            frozenColumns: 1,
            layoutEngine: new FrozenLayout()
        });

        expect(grid.getInitialColumns().length).toBe(3);
        expect(grid.getColumns().length).toBe(2);
        expect(grid.getColumns()[0].frozen).toBe(true);
        expect(grid.getColumns()[0].id).toBe('c2');
        expect(grid.getColumns()[1].frozen).toBeUndefined();
    });

    it('sets first two columns to frozen when 2 and all cols are visible', () => {
        const grid = new Grid(container(), [], threeCols(), {
            enableColumnReorder: false,
            frozenColumns: 2,
            layoutEngine: new FrozenLayout()
        });

        expect(grid.getInitialColumns().length).toBe(3);
        expect(grid.getColumns().length).toBe(3);
        expect(grid.getColumns()[0].frozen).toBe(true);
        expect(grid.getColumns()[1].frozen).toBe(true);
    });

    it('sets the first two visible column to frozen when 2', () => {
        var cols = threeCols();
        cols[0].visible = false;
        const grid = new Grid(container(), [], cols , {
            enableColumnReorder: false,
            frozenColumns: 2,
            layoutEngine: new FrozenLayout()
        });

        expect(grid.getInitialColumns().length).toBe(3);
        expect(grid.getColumns().length).toBe(2);
        expect(grid.getColumns()[0].frozen).toBe(true);
        expect(grid.getColumns()[0].id).toBe('c2');
        expect(grid.getColumns()[1].frozen).toBe(true);
        expect(grid.getColumns()[1].id).toBe('c3');
    });

    it('null gets deleted from options after processing', () => {
        const grid = new Grid(container(), [], threeCols(), {
            enableColumnReorder: false,
            frozenColumns: null,
            layoutEngine: new FrozenLayout()
        });

        expect(grid.getOptions().frozenColumns).toBeUndefined();
    });

    it('sets pane visibilities properly', () => {
        const div = container();
        const grid = new Grid(div, [], threeCols(), {
            enableColumnReorder: false,
            frozenColumns: 2,
            layoutEngine: new FrozenLayout()
        });

        const paneTopLeft = div.querySelector(`.${slickPaneTop}.${slickPaneRight}`) as HTMLDivElement;
        expect(paneTopLeft).toBeDefined();
        expect(paneTopLeft.style.display).toBe('');

        const paneTopRight = div.querySelector(`.${slickPaneTop}.${slickPaneRight}`) as HTMLDivElement;
        expect(paneTopRight).toBeDefined();
        expect(paneTopRight.style.display).toBe('');

        const paneBottomLeft = div.querySelector(`.${slickPaneBottom}.${slickPaneLeft}`) as HTMLDivElement;
        expect(paneBottomLeft).toBeDefined();
        expect(paneBottomLeft.style.display).toBe('none');

        const paneBottomRight = div.querySelector(`.${slickPaneBottom}.${slickPaneRight}`) as HTMLDivElement;
        expect(paneBottomRight).toBeDefined();
        expect(paneBottomRight.style.display).toBe('none');
    });


});
