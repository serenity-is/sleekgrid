import { PercentCompleteFormat, PercentCompleteBarFormat, YesNoFormat, CheckboxFormat } from "./format";

export namespace Formatters {
    export function PercentComplete(_row: number, _cell: number, value: any) {
        return PercentCompleteFormat({ value });
    }

    export function PercentCompleteBar(_row: number, _cell: number, value: any) {
        return PercentCompleteBarFormat({ value });
    }

    export function YesNo(_row: number, _cell: number, value: any) {
        return YesNoFormat({ value });
    }

    export function Checkbox(_row: number, _cell: number, value: any) {
        return CheckboxFormat({ value });
    }

    export function Checkmark(_row: number, _cell: number, value: any) {
        return CheckboxFormat({ value });
    }
}
