import { TextDocument } from "ui5plugin-parser";
import { IUI5Parser } from "ui5plugin-parser/dist/parser/abstraction/IUI5Parser";
export declare class XMLFormatter {
    private readonly _bShouldXmlFormatterTagEndByNewline;
    private readonly _bShouldXmlFormatterTagSpaceBeforeSelfClose;
    private readonly _parser;
    private readonly _indentation;
    constructor(parser: IUI5Parser, options?: {
        shouldXmlFormatterTagEndByNewline?: boolean;
        shouldXmlFormatterTagSpaceBeforeSelfClose?: boolean;
        indentation?: string;
    });
    formatDocument(document: TextDocument): string | undefined;
    private _removeUnnecessaryTags;
    private _formatNonCommentTag;
    private _formatAttributeValue;
    private _charIsInString;
    private _getCurvyBracketsCount;
    private _getPositionOfObjectEnd;
    private _getPositionOfIndentationEnd;
    private _formatAttributeObject;
    private _formatAttributeValuePart;
    private _modifyIndentationLevel;
    private _getIndentation;
    private _getTagName;
    private _getTagAttributes;
    private _getAllTags;
    private _processDocType;
    private _getIfAllStringsAreClosed;
    private _getTagBeginingIndex;
}
