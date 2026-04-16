import { TextDocument, UI5JSParser } from "ui5plugin-parser";
import { CustomJSClass } from "ui5plugin-parser/dist/classes/parsing/ui5class/js/CustomJSClass";
import { IError, JSLinters } from "../../Linter";
import { JSLinter } from "./abstraction/JSLinter";
export declare class InterfaceLinter extends JSLinter<UI5JSParser, CustomJSClass> {
    protected className: JSLinters;
    protected _getErrors(document: TextDocument): IError[];
}
