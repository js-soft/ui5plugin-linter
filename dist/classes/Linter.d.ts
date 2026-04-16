import { AbstractUI5Parser, TextDocument } from "ui5plugin-parser";
import { AbstractCustomClass } from "ui5plugin-parser/dist/classes/parsing/ui5class/AbstractCustomClass";
import { IRange } from "ui5plugin-parser/dist/classes/parsing/util/range/adapters/RangeAdapter";
import { ILinterConfigHandler } from "./config/ILinterConfigHandler";
export declare abstract class Linter<Parser extends AbstractUI5Parser<CustomClass>, CustomClass extends AbstractCustomClass> {
    protected readonly _parser: Parser;
    protected _configHandler: ILinterConfigHandler;
    constructor(parser: Parser, configHandler?: ILinterConfigHandler);
    abstract getLintingErrors(document: TextDocument): IError[];
}
export declare enum PropertiesLinters {
    UnusedTranslationsLinter = "UnusedTranslationsLinter",
    DuplicateTranslationLinter = "DuplicateTranslationLinter"
}
export declare enum XMLLinters {
    TagAttributeLinter = "TagAttributeLinter",
    TagAttributeDefaultValueLinter = "TagAttributeDefaultValueLinter",
    TagLinter = "TagLinter",
    UnusedNamespaceLinter = "UnusedNamespaceLinter",
    WrongFilePathLinter = "WrongFilePathLinter"
}
export declare enum JSLinters {
    AbstractClassLinter = "AbstractClassLinter",
    InterfaceLinter = "InterfaceLinter",
    PublicMemberLinter = "PublicMemberLinter",
    UnusedMemberLinter = "UnusedMemberLinter",
    WrongClassNameLinter = "WrongClassNameLinter",
    WrongFieldMethodLinter = "WrongFieldMethodLinter",
    WrongFilePathLinter = "WrongFilePathLinter",
    WrongImportLinter = "WrongImportLinter",
    WrongOverrideLinter = "WrongOverrideLinter",
    WrongParametersLinter = "WrongParametersLinter",
    UnusedClassLinter = "UnusedClassLinter",
    WrongNamespaceLinter = "WrongNamespaceLinter",
    EventTypeLinter = "EventTypeLinter"
}
export declare enum CustomDiagnosticType {
    NonExistentMethod = 1,
    NonExistentField = 2
}
export declare enum Severity {
    Warning = "Warning",
    Error = "Error",
    Information = "Information",
    Hint = "Hint"
}
export declare enum DiagnosticTag {
    Unnecessary = 1,
    Deprecated = 2
}
export interface IError {
    code: string;
    message: string;
    acornNode?: any;
    type?: CustomDiagnosticType;
    fieldName?: string;
    methodName?: string;
    sourceClassName?: string;
    source: string;
    tags?: DiagnosticTag[];
    severity: Severity;
    range: IRange;
    className: string;
    fsPath: string;
}
