import { TextDocument, UI5JSParser } from "ui5plugin-parser";
import { CustomJSClass } from "ui5plugin-parser/dist/classes/parsing/ui5class/js/CustomJSClass";
import { IError, JSLinters } from "../../Linter";
import { JSLinter } from "./abstraction/JSLinter";
export declare class WrongFieldMethodLinter extends JSLinter<UI5JSParser, CustomJSClass> {
    protected className: JSLinters;
    static timePerChar: number;
    protected _getErrors(document: TextDocument): IError[];
    private _getLintingErrors;
    private _getErrorsForExpression;
    private _fillDeprecationErrors;
    private _fillNonExistantMethodError;
    private _fillAccessLevelModifierErrors;
    private _getFieldsAndMethods;
    private _checkIfClassNameIsException;
}
