import { TextDocument } from "ui5plugin-parser";
import { XMLLinters } from "../../Linter";
import { IXMLError, XMLLinter } from "./abstraction/XMLLinter";
export declare class TagAttributeLinter extends XMLLinter {
    protected className: XMLLinters;
    protected _getErrors(document: TextDocument): IXMLError[];
    private _isTagIgnored;
    private _getTagAttributeErrors;
    private _validateTagAttribute;
    private _isAttributeIgnored;
    private _isAttributePatternIgnored;
    private _getIfAttributeNameIsDuplicated;
    private _validateAttributeValue;
    private _validateAttributeValueInCaseOfMethodCallFromMember;
    private _checkIfCommandIsMentionedInManifest;
    private _validateAttributeValueInCaseOfInTagRequire;
    private _validateAttributeName;
    private _isAttributeNameAlwaysValid;
}
