import { TextDocument, UI5JSParser } from "ui5plugin-parser";
import { CustomJSClass } from "ui5plugin-parser/dist/classes/parsing/ui5class/js/CustomJSClass";
import { IError, JSLinters } from "../../Linter";
import { JSLinter } from "./abstraction/JSLinter";
export declare class WrongParametersLinter extends JSLinter<UI5JSParser, CustomJSClass> {
    protected className: JSLinters;
    static timePerChar: number;
    protected _getErrors(document: TextDocument): IError[];
    private _lintParamQuantity;
    private _lintParamType;
    private _getIfClassNameIntersects;
    private _getIfClassesDiffers;
    private _swapClassNames;
    private _checkIfClassesAreEqual;
    private _swapClassName;
}
