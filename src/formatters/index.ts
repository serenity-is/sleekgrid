import { createFormatterContext } from "../core";
import { CheckboxFormatter, CheckmarkFormatter, PercentCompleteBarFormatter, PercentCompleteFormatter, YesNoFormatter } from "./formatters";

export * from "./formatters";

export namespace Formatters {
    export function PercentComplete(_row: number, _cell: number, value: any) {
        return PercentCompleteFormatter(createFormatterContext({ value }));
    }

    export function PercentCompleteBar(_row: number, _cell: number, value: any) {
        return PercentCompleteBarFormatter(createFormatterContext({ value }));
    }

    export function YesNo(_row: number, _cell: number, value: any) {
        return YesNoFormatter(createFormatterContext({ value }));
    }

    export function Checkbox(_row: number, _cell: number, value: any) {
        return CheckboxFormatter(createFormatterContext({ value }));
    }

    export function Checkmark(_row: number, _cell: number, value: any) {
        return CheckmarkFormatter(createFormatterContext({ value }));
    }
}

