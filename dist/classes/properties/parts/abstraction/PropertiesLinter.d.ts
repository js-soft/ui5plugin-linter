import { AbstractUI5Parser, TextDocument } from "ui5plugin-parser";
import { AbstractCustomClass } from "ui5plugin-parser/dist/classes/parsing/ui5class/AbstractCustomClass";
import { IError, Linter, PropertiesLinters } from "../../../Linter";
export declare abstract class PropertiesLinter extends Linter<AbstractUI5Parser<AbstractCustomClass>, AbstractCustomClass> {
    protected abstract className: PropertiesLinters;
    timePerChar: number;
    protected abstract _getErrors(document: TextDocument): IError[];
    getLintingErrors(document: TextDocument): IError[];
    private _logTime;
}
