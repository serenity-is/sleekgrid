import { TextEditor, IntegerEditor, FloatEditor, DateEditor, YesNoSelectEditor, CheckboxEditor, PercentCompleteEditor, LongTextEditor } from "./editors";

export * from "./editors"

export namespace Editors {
    export const Text = TextEditor;
    export const Integer = IntegerEditor;
    export const Float = FloatEditor;
    export const Date = DateEditor;
    export const YesNoSelect = YesNoSelectEditor;
    export const Checkbox = CheckboxEditor;
    export const PercentComplete = PercentCompleteEditor;
    export const LongText = LongTextEditor;
}
