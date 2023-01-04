import { Grid } from "@/grid/grid";
import { BasicLayout, GridOptions, ViewportInfo } from "@/grid";

describe('canvas node', () => {
    it('should return canvas node for cell or column index using layout', () => {
        const layoutEngine = new BasicLayout();

        const canvasNode = document.createElement('div');
        layoutEngine.getCanvasNodeFor = (_cell, _row) => {
            return canvasNode;
        };

        const grid = new Grid(document.createElement('div'), [], [], {layoutEngine});

        expect(grid.getCanvasNode(0, 0)).toBe(canvasNode);
    });

    it('should be able to get canvas with column name', () => {
        const layoutEngine = new BasicLayout();

        let getCanvasNodeForParams: {cell: number, row: number};
        const oldGetCanvasNodeFor = layoutEngine.getCanvasNodeFor;
        layoutEngine.getCanvasNodeFor = (cell, row) => {
            getCanvasNodeForParams = {cell: cell, row: row};
            return oldGetCanvasNodeFor(cell, row);
        };

        const grid = new Grid(document.createElement('div'), [], [
            {field: "c1"},
            {field: "c2"}
        ], { layoutEngine });

        grid.getCanvasNode('c2');
        expect(getCanvasNodeForParams.cell).toBe(1);
        expect(getCanvasNodeForParams.row).toBe(0);

        grid.getCanvasNode('c1', 5);
        expect(getCanvasNodeForParams.cell).toBe(0);
        expect(getCanvasNodeForParams.row).toBe(5);
    });

    it('should return canvases from layout', () => {
        const layoutEngine = new BasicLayout();

        const canvasNodes = [document.createElement('div'), document.createElement('div')];
        layoutEngine.getCanvasNodes = () => {
            return canvasNodes;
        };

        const grid = new Grid(document.createElement('div'), [], [], {layoutEngine});

        expect(grid.getCanvases()).toBe(canvasNodes);
    });

    it('should return canvases wrapped with jQuery if jQuery is available', () => {
        function MockJQueryStatic(el: HTMLElement | HTMLElement[]) {
            if (!(this instanceof MockJQueryStatic)) {
                return new (MockJQueryStatic as any)(el);
            }

            this.elements = Array.isArray(el) ? el : [el];
            this.length = this.elements.length;

            for (let i = 0; i < this.length; i++) {
                Object.defineProperty(this, i, {
                    get: () => this.elements[i]
                });
            }

            this.empty = () => this;
            this.on = () => this;
        }

        MockJQueryStatic.fn = {
            mousewheel: function () {
                return this;
            }
        };

        const layoutEngine = new BasicLayout();

        const canvasNodes = [document.createElement('div'), document.createElement('div')];
        layoutEngine.getCanvasNodes = () => {
            return canvasNodes;
        };

        const gridOptions: GridOptions = {
            jQuery: MockJQueryStatic as any,
            layoutEngine
        };

        const container = new (MockJQueryStatic as any)(document.createElement("div"));
        const grid = new Grid(container as any, [], [], gridOptions);

        const canvases = grid.getCanvases();
        expect(canvases).toBeInstanceOf(MockJQueryStatic);
        expect(canvases.length).toBe(2);
        expect(canvases[0]).toBe(canvasNodes[0]);
        expect(canvases[1]).toBe(canvasNodes[1]);
    });

    it('should set viewportInfo hasVScroll based on row count and rowHeight if autoHeight is false', () => {
        const layoutEngine = new BasicLayout();
        let getViewportInfo : () => ViewportInfo;

        const oldLayoutEngineInit = layoutEngine.init;
        layoutEngine.init = function (layoutHost) {
            getViewportInfo = layoutHost.getViewportInfo;
            oldLayoutEngineInit(layoutHost);
        }

        const gridOptions: GridOptions = {
            layoutEngine,
            autoHeight: false,
            rowHeight: 20
        };

        const data = [
            {c1: 1},
            {c1: 2},
            {c1: 3}
        ];

        const columns = [
            {field: "c1"}
        ];

        const dataHeight = data.length * gridOptions.rowHeight;
        let viewportHeight = 10;

        const oldGetComputedStyles = window.getComputedStyle;
        window.getComputedStyle = (el: HTMLElement) => {
            if (el === layoutEngine.getScrollContainerY())
                return {height: viewportHeight + 'px'} as any;

            return oldGetComputedStyles(el);
        }

        new Grid(document.createElement('div'), data, columns, gridOptions);
        const viewportWithVScroll = getViewportInfo();

        viewportHeight = dataHeight + 1;
        new Grid(document.createElement('div'), data, columns, gridOptions);
        const viewportWithoutVScroll = getViewportInfo(); /* reference of this function has changed */

        window.getComputedStyle = oldGetComputedStyles;

        expect(viewportWithVScroll.hasVScroll).toBe(true);
        expect(viewportWithoutVScroll.hasVScroll).toBe(false);
    });

    it('should return activeCanvasNode as null if its not set', () => {
        const grid = new Grid(document.createElement('div'), [], [], {});

        expect(grid.getActiveCanvasNode()).toBeFalsy();
    });

    it('should return activeCanvasNode after its set with an event', () => {
        const oldGetComputedStyle = window.getComputedStyle;
        window.getComputedStyle = (_el: HTMLElement) => {
            return {height: '1000px', width: '1000px', getPropertyValue: (_prop: string) => 1000} as any;
        };

        const grid = new Grid(document.createElement('div'), [{c1: 1, c2: 8}], [{field: "c1"}, {field: "c2"}], {
            rowHeight: -1
        });

        window.getComputedStyle = oldGetComputedStyle;

        const cellNode = grid.getCellNode(0, 0)

        grid.setActiveCanvasNode({
            target: cellNode
        });

        expect(grid.getActiveCanvasNode()).toBeTruthy();
    });

    it('should traverse towards root of the document on activeCanvasNode', () => {
        const container = document.createElement('div');
        const canvasNode = document.createElement('div');
        canvasNode.classList.add('grid-canvas');

        canvasNode.appendChild(container); // Canvas -> Container -> Grid

        const grid = new Grid(container, [], [], {});

        grid.setActiveCanvasNode({
            target: container
        });

        expect(grid.getActiveCanvasNode()).toBe(canvasNode);
    });

    it('should not set active canvas if event is null', () => {
        const grid = new Grid(document.createElement('div'), [], [], {});

        grid.setActiveCanvasNode(null);

        expect(grid.getActiveCanvasNode()).toBeFalsy();
    });
});
