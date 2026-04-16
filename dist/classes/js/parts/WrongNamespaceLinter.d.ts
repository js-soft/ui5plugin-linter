import { AnyCustomTSClass, TextDocument, UI5TSParser } from "ui5plugin-parser";
import { IError, JSLinters } from "../../Linter";
import { JSLinter } from "./abstraction/JSLinter";
export declare class WrongNamespaceLinter extends JSLinter<UI5TSParser, AnyCustomTSClass> {
    protected className: JSLinters;
    protected _getErrors(document: TextDocument): IError[];
}
