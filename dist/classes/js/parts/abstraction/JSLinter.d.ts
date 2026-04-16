import { AbstractUI5Parser, TextDocument } from "ui5plugin-parser";
import { AbstractCustomClass } from "ui5plugin-parser/dist/classes/parsing/ui5class/AbstractCustomClass";
import { IError, JSLinters, Linter } from "../../../Linter";
export declare abstract class JSLinter<Parser extends AbstractUI5Parser<CustomClass>, CustomClass extends AbstractCustomClass> extends Linter<Parser, CustomClass> {
    protected abstract className: JSLinters;
    timePerChar: number;
    protected abstract _getErrors(document: TextDocument): IError[];
    getLintingErrors(document: TextDocument): IError[];
    private _logTime;
}
