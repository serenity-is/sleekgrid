import { FormatterContext, htmlEncode } from "../core";

export function PercentCompleteFormat(ctx: FormatterContext) {
    if (ctx.value == null || ctx.value === "")
        return "-";
    if (ctx.value < 50)
        return "<span style='color:red; font-weight:bold;'>" + htmlEncode(ctx.value) + "%</span>";

    return "<span style='color:green'>" + htmlEncode(ctx.value) + "%</span>";
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

export function YesNoFormat(ctx: FormatterContext) {
    return ctx.value ? 'Yes' : 'No';
}


export function CheckboxFormat(ctx: FormatterContext) {
    return `<i class="slick-checkbox slick-edit-preclick${ctx.value ? " checked" : ""}"></i>`;
}

export function CheckmarkFormat(ctx: FormatterContext) {
    return ctx.value ? '<i class="slick-checkmark"></i>' : '';
}
