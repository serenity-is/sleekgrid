import { ArgsColumn, Grid, IPlugin } from "../grid";

export interface AutoTooltipsOptions {
    enableForCells?: boolean;
    enableForHeaderCells?: boolean;
    maxToolTipLength?: number;
    replaceExisting?: boolean;
}

export class AutoTooltips implements IPlugin {

    private _grid: Grid;
    private _options: AutoTooltipsOptions;

    constructor(options: AutoTooltipsOptions) {
        this._options = Object.assign({}, AutoTooltips.defaultOptions, options);
    }

    public static defaultOptions: AutoTooltipsOptions = {
        enableForCells: true,
        enableForHeaderCells: false,
        maxToolTipLength: null,
        replaceExisting: true
    }

    init(grid: Grid) {
        this._grid = grid;

        if (this._options.enableForCells)
            this._grid.onMouseEnter.subscribe(this.handleMouseEnter);

        if (this._options.enableForHeaderCells)
            this._grid.onHeaderMouseEnter.subscribe(this.handleHeaderMouseEnter);
    }

    destroy() {
        if (this._options.enableForCells) 
            this._grid.onMouseEnter.unsubscribe(this.handleMouseEnter);

        if (this._options.enableForHeaderCells) 
            this._grid.onHeaderMouseEnter.unsubscribe(this.handleHeaderMouseEnter);
    }

    private handleMouseEnter = (e: MouseEvent) => {
        var cell = this._grid.getCellFromEvent(e);
        if (!cell)
            return;
        var node = this._grid.getCellNode(cell.row, cell.cell);
        if (!node)
            return;
        var text;
        if (!node.title || this._options.replaceExisting) {
            if (node.clientWidth < node.scrollWidth) {
                text = node.textContent?.trim() ?? "";
                if (this._options.maxToolTipLength && 
                    text.length > this._options.maxToolTipLength) {
                    text = text.substring(0, this._options.maxToolTipLength - 3) + "...";
                }
            } else {
                text = "";
            }
            node.title = text;
        }
        node = null;
    }

    private handleHeaderMouseEnter = (e: MouseEvent, args: ArgsColumn) => {
        var column = args.column;
        if (column && !column.toolTip) {
            var node = (e.target as HTMLElement).closest(".slick-header-column") as HTMLElement;
            node && (node.title = (node.clientWidth < node.scrollWidth ? column.name : ""));
        }
    }

    public pluginName = "AutoTooltips";
}