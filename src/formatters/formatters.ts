import { escape, FormatterContext } from "../core";

export function PercentCompleteFormatter(ctx: FormatterContext) {
    if (ctx.value == null || ctx.value === "")
        return "-";
    if (ctx.value < 50)
        return "<span style='color:red; font-weight:bold;'>" + ctx.escape() + "%</span>";

    return "<span style='color:green'>" + escape(ctx.value) + "%</span>";
}

export function PercentCompleteBarFormatter(ctx: FormatterContext) {
    if (ctx.value == null || ctx.value === "")
        return "";

    var color;
    if (ctx.value < 30)
        color = "red";
    else if (ctx.value < 70)
        color = "silver";
    else
        color = "green";

    return "<span class='percent-complete-bar slick-percentcomplete-bar' style='background:" + color + ";width:" + escape(ctx.value) + "%' title='" + escape(ctx.value) + "%'></span>";
}

export function YesNoFormatter(ctx: FormatterContext) {
    return ctx.value ? 'Yes' : 'No';
}


export function CheckboxFormatter(ctx: FormatterContext) {
    return `<i class="slick-checkbox slick-edit-preclick${ctx.value ? " checked" : ""}"></i>`;
}

export function CheckmarkFormatter(ctx: FormatterContext) {
    return ctx.value ? '<i class="slick-checkmark"></i>' : '';
}

