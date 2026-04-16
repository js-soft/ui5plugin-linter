import { TextDocument } from "ui5plugin-parser";
import { Linter } from "../Linter";
export declare class XMLLinterErrorFactory extends Linter<any, any> {
    timePerchar: number;
    getLintingErrors(document: TextDocument): import("./linters/abstraction/XMLLinter").IXMLError[];
}
