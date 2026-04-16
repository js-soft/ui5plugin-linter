import { TextDocument } from "ui5plugin-parser";
import { IUI5Parser } from "ui5plugin-parser/dist/parser/abstraction/IUI5Parser";
import { ILinterConfigHandler } from "../../../config/ILinterConfigHandler";
export default abstract class AMeaningAssumptionGenerator {
    protected readonly _pattern: string;
    protected readonly _document: TextDocument;
    protected readonly _parser: IUI5Parser;
    protected readonly _configHandler: ILinterConfigHandler;
    constructor(pattern: string, document: TextDocument, parser: IUI5Parser, configHandler: ILinterConfigHandler);
    protected _generateMeaningAssumption(tagAttributes: string[]): string | undefined;
    protected _getMeaningAssumptionFrom(attributeValue: string): string | undefined;
    private _getI18nTextById;
    protected _isUpperCase(anyString?: string): boolean | undefined;
    protected _toFirstCharLower(anyString?: string): string;
    protected _toFirstCharUpper(anyString?: string): string;
}
