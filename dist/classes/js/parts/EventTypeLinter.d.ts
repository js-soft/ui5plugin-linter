import { AnyCustomTSClass, TextDocument, UI5TSParser } from "ui5plugin-parser";
import { IError, JSLinters } from "../../Linter";
import { JSLinter } from "./abstraction/JSLinter";
export declare class EventTypeLinter extends JSLinter<UI5TSParser, AnyCustomTSClass> {
    protected className: JSLinters;
    protected _getErrors(document: TextDocument): IError[];
    private _getEventTypeErrorsFromXMLDocument;
    private _generateEvent;
    private _getEventHandlerData;
    private _getEventData;
    private _getClassAndParents;
}
