import { TextDocument } from "ui5plugin-parser";
import { IError, Linter } from "../Linter";
export declare class PropertiesLinterErrorFactory extends Linter<any, any> {
    getLintingErrors(document: TextDocument): IError[];
}
