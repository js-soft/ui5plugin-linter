"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticTag = exports.Severity = exports.CustomDiagnosticType = exports.JSLinters = exports.XMLLinters = exports.PropertiesLinters = exports.Linter = void 0;
const PackageLinterConfigHandler_1 = require("./config/PackageLinterConfigHandler");
class Linter {
    constructor(parser, configHandler) {
        this._parser = parser;
        this._configHandler = configHandler || new PackageLinterConfigHandler_1.PackageLinterConfigHandler(parser);
    }
}
exports.Linter = Linter;
var PropertiesLinters;
(function (PropertiesLinters) {
    PropertiesLinters["UnusedTranslationsLinter"] = "UnusedTranslationsLinter";
    PropertiesLinters["DuplicateTranslationLinter"] = "DuplicateTranslationLinter";
})(PropertiesLinters || (exports.PropertiesLinters = PropertiesLinters = {}));
var XMLLinters;
(function (XMLLinters) {
    XMLLinters["TagAttributeLinter"] = "TagAttributeLinter";
    XMLLinters["TagAttributeDefaultValueLinter"] = "TagAttributeDefaultValueLinter";
    XMLLinters["TagLinter"] = "TagLinter";
    XMLLinters["UnusedNamespaceLinter"] = "UnusedNamespaceLinter";
    XMLLinters["WrongFilePathLinter"] = "WrongFilePathLinter";
})(XMLLinters || (exports.XMLLinters = XMLLinters = {}));
var JSLinters;
(function (JSLinters) {
    JSLinters["AbstractClassLinter"] = "AbstractClassLinter";
    JSLinters["InterfaceLinter"] = "InterfaceLinter";
    JSLinters["PublicMemberLinter"] = "PublicMemberLinter";
    JSLinters["UnusedMemberLinter"] = "UnusedMemberLinter";
    JSLinters["WrongClassNameLinter"] = "WrongClassNameLinter";
    JSLinters["WrongFieldMethodLinter"] = "WrongFieldMethodLinter";
    JSLinters["WrongFilePathLinter"] = "WrongFilePathLinter";
    JSLinters["WrongImportLinter"] = "WrongImportLinter";
    JSLinters["WrongOverrideLinter"] = "WrongOverrideLinter";
    JSLinters["WrongParametersLinter"] = "WrongParametersLinter";
    JSLinters["UnusedClassLinter"] = "UnusedClassLinter";
    JSLinters["WrongNamespaceLinter"] = "WrongNamespaceLinter";
    JSLinters["EventTypeLinter"] = "EventTypeLinter";
})(JSLinters || (exports.JSLinters = JSLinters = {}));
var CustomDiagnosticType;
(function (CustomDiagnosticType) {
    CustomDiagnosticType[CustomDiagnosticType["NonExistentMethod"] = 1] = "NonExistentMethod";
    CustomDiagnosticType[CustomDiagnosticType["NonExistentField"] = 2] = "NonExistentField";
})(CustomDiagnosticType || (exports.CustomDiagnosticType = CustomDiagnosticType = {}));
var Severity;
(function (Severity) {
    Severity["Warning"] = "Warning";
    Severity["Error"] = "Error";
    Severity["Information"] = "Information";
    Severity["Hint"] = "Hint";
})(Severity || (exports.Severity = Severity = {}));
var DiagnosticTag;
(function (DiagnosticTag) {
    DiagnosticTag[DiagnosticTag["Unnecessary"] = 1] = "Unnecessary";
    DiagnosticTag[DiagnosticTag["Deprecated"] = 2] = "Deprecated";
})(DiagnosticTag || (exports.DiagnosticTag = DiagnosticTag = {}));
