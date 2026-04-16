import { TextDocument } from "ui5plugin-parser";
import { XMLLinters } from "../../Linter";
import { IXMLError, XMLLinter } from "./abstraction/XMLLinter";
export declare class UnusedNamespaceLinter extends XMLLinter {
    protected className: XMLLinters;
    protected _getErrors(document: TextDocument): IXMLError[];
}
