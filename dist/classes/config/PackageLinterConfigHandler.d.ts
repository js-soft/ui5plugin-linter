import { TextDocument } from "ui5plugin-parser";
import { IUI5Parser } from "ui5plugin-parser/dist/parser/abstraction/IUI5Parser";
import { JSLinters, PropertiesLinters, Severity, XMLLinters } from "../Linter";
import { ILinterConfigHandler, JSLinterException } from "./ILinterConfigHandler";
export declare class PackageLinterConfigHandler implements ILinterConfigHandler {
    static readonly configCache: {
        [key: string]: IUI5PackageConfigEntry;
    };
    private static _globalConfig?;
    static setGlobalConfigPath(fsPath: string): void;
    protected readonly _config: IUI5PackageConfigEntry;
    configPath?: string;
    packagePath: string;
    protected readonly _parser: IUI5Parser;
    constructor(parser: IUI5Parser, packagePath?: string);
    getIfLintingShouldBeSkipped(document: TextDocument): boolean;
    private _cache;
    getSeverity(linter: JSLinters | XMLLinters | PropertiesLinters): Severity;
    private _getDefaultSeverityFor;
    getJSLinterExceptions(): JSLinterException[];
    getIdNamingPattern(): string;
    getEventNamingPattern(): string;
    getAttributesToCheck(): string[];
    getLinterUsage(linter: JSLinters | XMLLinters | PropertiesLinters): boolean;
    _getIfLibraryVersionIsGreaterThan(expectedVersionText: string): boolean;
    getPropertiesLinterExceptions(): string[];
    checkIfMemberIsException(className?: string, memberName?: string): boolean;
    private _checkIfMemberIsEventHandler;
}
export interface IUI5LinterEntryFields {
    severity?: {
        [key in JSLinters | XMLLinters | PropertiesLinters]: Severity;
    };
    usage?: {
        [key in JSLinters | XMLLinters | PropertiesLinters]: boolean;
    };
    jsLinterExceptions?: JSLinterException[];
    jsClassExceptions?: string[];
    xmlClassExceptions?: string[];
    propertiesLinterExceptions?: string[];
    componentsToInclude?: string[];
    componentsToExclude?: string[];
    idNamingPattern?: string;
    eventNamingPattern?: string;
    attributesToCheck?: string[];
}
export interface IUI5LinterEntry {
    ui5linter?: IUI5LinterEntryFields;
}
export interface IUI5PackageConfigEntry {
    ui5?: IUI5LinterEntry;
}
