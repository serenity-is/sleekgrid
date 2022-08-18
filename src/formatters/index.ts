import { FormatterContext, htmlEncode } from "../core";

export function PercentCompleteFormat(ctx: FormatterContext) {
    if (ctx.value == null || ctx.value === "")
        return "-";
    if (ctx.value < 50)
        return "<span style='color:red; font-weight:bold;'>" + htmlEncode(ctx.value) + "%</span>";

    return "<span style='color:green'>" + htmlEncode(ctx.value) + "%</span>";
}

export function PercentCompleteFormatter(_row: number, _cell: number, value: any) {
    return PercentCompleteFormat({ value });
}

export function PercentCompleteBarFormat(ctx: FormatterContext) {
    if (ctx.value == null || ctx.value === "")
        return "";

    var color;
    if (ctx.value < 30)
        color = "red";
    else if (ctx.value < 70)
        color = "silver";
    else
        color = "green";

    return "<span class='percent-complete-bar' style='background:" + color + ";width:" + ctx.value + "%' title='" + ctx.value + "%'></span>";
}

export function PercentCompleteBarFormatter(_row: number, _cell: number, value: any) {
    return PercentCompleteBarFormat({ value });
}

export function YesNoFormat(ctx: FormatterContext) {
    return ctx.value ? 'Yes' : 'No';
}

export function YesNoFormatter(_row: number, _cell: number, value: any) {
    return YesNoFormat({ value });
}

export function CheckboxFormat(ctx: FormatterContext) {
    return `<i class="slick-edit-preclick fa ${ctx.value ? "fa-check-square-o" : "fa-square-o"}"></i>`;
}

export function CheckboxFormatter(_row: number, _cell: number, value: any) {
    return CheckboxFormat({ value });
}

export function CheckmarkFormat(ctx: FormatterContext) {
    return ctx.value ? '<i class="fa fa-check"></i>' : '';
}

export function CheckmarkFormatter(_row: number, _cell: number, value: any) {
    return CheckboxFormat({ value });
}
