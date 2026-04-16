import { TextDocument } from "ui5plugin-parser";
import { XMLLinters } from "../../Linter";
import { IXMLError, XMLLinter } from "./abstraction/XMLLinter";
export declare class TagLinter extends XMLLinter {
    protected className: XMLLinters;
    protected _getErrors(document: TextDocument): IXMLError[];
    private _getClassNameErrors;
    private _lintAggregation;
    private _lintClass;
    private _lintIfClassIsDeprecated;
    private _lintIfClassExists;
    private _findAggregation;
    private _isClassException;
}
