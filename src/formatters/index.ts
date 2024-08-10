import { escapeHtml } from "../core";
import { CheckboxFormatter, CheckmarkFormatter, PercentCompleteBarFormatter, PercentCompleteFormatter, YesNoFormatter } from "./formatters";

export * from "./formatters";

export namespace Formatters {
    export function PercentComplete(_row: number, _cell: number, value: any) {
        return PercentCompleteFormatter({ escape: escapeHtml, value });
    }

    export function PercentCompleteBar(_row: number, _cell: number, value: any) {
        return PercentCompleteBarFormatter({ escape: escapeHtml, value });
    }

    export function YesNo(_row: number, _cell: number, value: any) {
        return YesNoFormatter({ escape: escapeHtml, value });
    }

    export function Checkbox(_row: number, _cell: number, value: any) {
        return CheckboxFormatter({ escape: escapeHtml, value });
    }

    export function Checkmark(_row: number, _cell: number, value: any) {
        return CheckmarkFormatter({ escape: escapeHtml, value });
    }
}

