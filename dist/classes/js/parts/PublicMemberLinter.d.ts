import { AbstractUI5Parser, TextDocument } from "ui5plugin-parser";
import { AbstractCustomClass } from "ui5plugin-parser/dist/classes/parsing/ui5class/AbstractCustomClass";
import { IError, JSLinters } from "../../Linter";
import { JSLinter } from "./abstraction/JSLinter";
export declare class PublicMemberLinter<Parser extends AbstractUI5Parser<CustomClass>, CustomClass extends AbstractCustomClass> extends JSLinter<Parser, CustomClass> {
    protected className: JSLinters;
    protected _getErrors(document: TextDocument): IError[];
    private _checkIfMemberIsUsedElsewhere;
    private _checkIfMemberIsException;
    private _checkIfThisIsStandardMethodFromPropertyEventAggregationAssociation;
}
