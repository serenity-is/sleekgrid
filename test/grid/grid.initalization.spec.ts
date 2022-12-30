import { Column, columnDefaults } from "@/core/column";
import { Grid } from "@/grid/grid";
import { gridDefaults, GridOptions } from "@/grid";

function threeCols(): Column[] {
    return [{
        id: 'c1',
        name: 'c1',
        field: 'c1'
    }, {
        id: 'c2',
        name: 'c2',
        field: 'c2'
    }, {
        id: 'c3',
        name: 'c3',
        field: 'c3'
    }]
}

describe('Grid columns', () => {
    it('should set column defaults from colDefaults', () => {
        if (Object.keys(columnDefaults).length === 0)
            return;

        const gridColumns = threeCols();
        new Grid(document.createElement("div"), [], gridColumns, {});

        expect(gridColumns).not.toStrictEqual(threeCols());

        for (const col of gridColumns)
            expect(col).toMatchObject(columnDefaults);
    });

    it('should set default width of the columns using gridDefaults', () => {
        if (gridDefaults.defaultColumnWidth === undefined)
            return;

        const gridColumns = threeCols();
        new Grid(document.createElement("div"), [], gridColumns, {});

        expect(gridColumns).not.toStrictEqual(threeCols());

        for (const col of gridColumns)
            expect(col.width).toBe(gridDefaults.defaultColumnWidth);
    });

    it('should set default width of the columns using gridOptions.defaultColumnWidth', () => {
        const gridColumns = threeCols();
        new Grid(document.createElement("div"), [], gridColumns, { defaultColumnWidth: 123 });

        for (const col of gridColumns)
            expect(col.width).toBe(123);
    });

    it('should set default width of the columns using columnDefaults.width', () => {
        const gridColumns = threeCols();
        new Grid(document.createElement("div"), [], gridColumns, { defaultColumnWidth: undefined });

        for (const col of gridColumns)
            expect(col.width).toBe(columnDefaults.width);
    });

    it('should not override already existing properties on the columns', () => {
        const colDefaultFirstProperty = Object.keys(columnDefaults).filter(x => x !== "width")[0];

        const gridColumns = threeCols();
        gridColumns[0].width = 123;

        if (colDefaultFirstProperty)
            gridColumns[0][colDefaultFirstProperty] = "123";

        new Grid(document.createElement("div"), [], gridColumns, { defaultColumnWidth: 456 });

        expect(gridColumns[0].width).toBe(123);
        if (colDefaultFirstProperty)
            expect(gridColumns[0][colDefaultFirstProperty]).toBe("123");

        for (let i = 1; i < gridColumns.length; i++)
        {
            expect(gridColumns[i].width).toBe(456);
            if (colDefaultFirstProperty)
                expect(gridColumns[i][colDefaultFirstProperty]).toBe(columnDefaults[colDefaultFirstProperty]);
        }
    });
});

describe('options', () => {
    // it('should be able to set jQuery from options', () => {
    //     const mockJQuery = {
    //         foo: true
    //     };
    //
    //     const gridOptions: GridOptions = {
    //         jQuery: mockJQuery as any,
    //     };
    //
    //     new Grid(document.createElement("div"), [], [], gridOptions);
    //
    //     expect(gridOptions.jQuery).toStrictEqual(mockJQuery);
    // });

    it('should throw an error if container is null', () => {
        expect(() => new Grid(null, [], [], {})).toThrow();
    });

    it('should add slick-container class to the container', () => {
        const container = document.createElement("div");
        new Grid(container, [], [], {});

        expect(container.classList.contains("slick-container")).toBe(true);
    });

    // it('should setup for compat d&d plugin if createPreHeaderPanel is true', () => {
    //     const gridOptions: GridOptions = {
    //         createPreHeaderPanel: true,
    //         groupingPanel: true
    //     };
    //
    //     const grid = new Grid(document.createElement("div"), [], [], gridOptions);
    //
    //     expect(gridOptions.createPreHeaderPanel).toBe(true);
    //     expect(gridOptions.groupingPanel).toBe(true);
    // });

    it('should set default options', () => {
        const gridOptions: GridOptions = {}
        const grid = new Grid(document.createElement("div"), [], [], gridOptions);

        expect(grid.getOptions()).toMatchObject(gridDefaults);
    });

    it('should not override options with defaults', () => {
        const gridOptions: GridOptions = {
            rowHeight: (gridDefaults.rowHeight ?? 0) + 1
        };

        const grid = new Grid(document.createElement("div"), [], [], gridOptions);

        expect(grid.getOptions().rowHeight).toBe(gridOptions.rowHeight);
    });

    it('should set rtl to true if body has rtl class', () => {
        document.body.classList.add("rtl");
        const grid = new Grid(document.createElement("div"), [], [], {});

        expect(grid.getOptions().rtl).toBe(true);
        document.body.classList.remove("rtl");
    });

    it('should set rtl to true if container has rtl direction', () => {
        const oldGetComputedStyle = window.getComputedStyle;
        window.getComputedStyle = () => {
            return {
                direction: "rtl",
                getPropertyValue: () => null as any
            } as any;
        };

        const grid = new Grid(document.createElement("div"), [], [], {});
        window.getComputedStyle = oldGetComputedStyle;

        expect(grid.getOptions().rtl).toBe(true);
    });

    it('should set options.leaveSpaceForNewRows to false if autoHeight is true', () => {
        const gridOptions: GridOptions = {
            autoHeight: true,
            leaveSpaceForNewRows: true
        };

        const grid = new Grid(document.createElement("div"), [], [], gridOptions);

        expect(grid.getOptions().leaveSpaceForNewRows).toBe(false);
    });
});

describe('layout', () => {
    it('should empty innerHTML of the container', () => {
        const container = document.createElement("div");
        container.innerHTML = "foo 123";

        new Grid(container, [], [], {});

        expect(container.innerHTML).not.toContain("foo 123");
    });

    it('should set overflow to hidden', () => {
        const container = document.createElement("div");
        new Grid(container, [], [], {});

        expect(container.style.overflow).toBe("hidden");
    });

    it('should set outline to 0', () => {
        const container = document.createElement("div");
        new Grid(container, [], [], {});

        expect(container.style.outline).toBe("0");
    });

    it('should add uid as a class to the container', () => {
        const container = document.createElement("div");
        const grid = new Grid(container, [], [], {});

        const uid = (grid as any).uid as string;

        if (!uid)
            return;

        expect(container.classList.contains(uid)).toBe(true);
    });

    it('should add ui-widget class if useLegacyUI is true', () => {
        const container = document.createElement("div");
        new Grid(container, [], [], { useLegacyUI: true });

        const container2 = document.createElement("div");
        new Grid(container2, [], [], { useLegacyUI: false });

        expect(container.classList.contains("ui-widget")).toBe(true);
        expect(container2.classList.contains("ui-widget")).toBe(false);
    });

    it('should set position to relative if its not relative or absolute or fixed', () => {
        const oldGetComputedStyle = window.getComputedStyle;
        window.getComputedStyle = () => {
            return {
                position: "static",
                getPropertyValue: () => null as any
            } as any;
        }

        const container = document.createElement("div");
        new Grid(container, [], [], {});

        window.getComputedStyle = oldGetComputedStyle;

        expect(container.style.position).toBe("relative");
    });

    it('should append slick-focus-sink to the container', () => {
        const container = document.createElement("div");
        new Grid(container, [], [], {});

        expect(container.querySelector(".slick-focus-sink")).not.toBeNull();
    });

    it('should append slick-grouping-panel to the container if groupingPanel is true', () => {
        const container = document.createElement("div");
        new Grid(container, [], [], { groupingPanel: true });

        expect(container.querySelector(".slick-grouping-panel")).not.toBeNull();
    });

    it('should append slick-preheader-panel if groupingPanel and preHeaderPanel are true', () => {
        const container = document.createElement("div");
        new Grid(container, [], [], { groupingPanel: true, createPreHeaderPanel: true });

        expect(container.querySelector(".slick-grouping-panel")).not.toBeNull();
        expect(container.querySelector(".slick-preheader-panel")).not.toBeNull();

    });
});
