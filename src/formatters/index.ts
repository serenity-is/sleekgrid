import { escape } from "../core";
import { CheckboxFormatter, CheckmarkFormatter, PercentCompleteBarFormatter, PercentCompleteFormatter, YesNoFormatter } from "./formatters";

export * from "./formatters";

export namespace Formatters {
    export function PercentComplete(_row: number, _cell: number, value: any) {
        return PercentCompleteFormatter({ escape, value });
    }

    export function PercentCompleteBar(_row: number, _cell: number, value: any) {
        return PercentCompleteBarFormatter({ escape, value });
    }

    export function YesNo(_row: number, _cell: number, value: any) {
        return YesNoFormatter({ escape, value });
    }

    export function Checkbox(_row: number, _cell: number, value: any) {
        return CheckboxFormatter({ escape, value });
    }

    export function Checkmark(_row: number, _cell: number, value: any) {
        return CheckmarkFormatter({ escape, value });
    }
}

