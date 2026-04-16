import { AnyCustomTSClass, TextDocument, UI5TSParser } from "ui5plugin-parser";
import { IError, Linter } from "../Linter";
export declare class TSLinterErrorFactory extends Linter<UI5TSParser, AnyCustomTSClass> {
    timePerchar: number;
    getLintingErrors(document: TextDocument): IError[];
}
