import { AbstractUI5Parser, TextDocument } from "ui5plugin-parser";
import { AbstractCustomClass } from "ui5plugin-parser/dist/classes/parsing/ui5class/AbstractCustomClass";
import { IError, Linter, XMLLinters } from "../../../Linter";
export interface IXMLError extends IError {
    attribute?: string;
}
export declare abstract class XMLLinter extends Linter<AbstractUI5Parser<AbstractCustomClass>, AbstractCustomClass> {
    protected abstract className: XMLLinters;
    timePerChar: number;
    protected abstract _getErrors(document: TextDocument): IError[];
    getLintingErrors(document: TextDocument): IXMLError[];
    private _logTime;
}
