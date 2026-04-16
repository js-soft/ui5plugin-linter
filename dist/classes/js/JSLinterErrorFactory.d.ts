import { TextDocument, UI5JSParser } from "ui5plugin-parser";
import { CustomJSClass } from "ui5plugin-parser/dist/classes/parsing/ui5class/js/CustomJSClass";
import { IError, Linter } from "../Linter";
export declare class JSLinterErrorFactory extends Linter<UI5JSParser, CustomJSClass> {
    timePerchar: number;
    getLintingErrors(document: TextDocument): IError[];
}
