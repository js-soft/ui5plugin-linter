import { TextDocument } from "ui5plugin-parser";
import { IError, PropertiesLinters } from "../../Linter";
import { PropertiesLinter } from "./abstraction/PropertiesLinter";
export declare class DuplicateTranslationLinter extends PropertiesLinter {
    protected className: PropertiesLinters;
    protected _getErrors(document: TextDocument): IError[] | IError[];
    private _getTranslationErrors;
    private _getIfTranslationIsDuplicated;
}
