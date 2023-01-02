import { Grid } from "@/grid/grid";
import { BasicLayout, GridOptions } from "@/grid";


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
});
