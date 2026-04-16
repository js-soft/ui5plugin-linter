"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageLinterConfigHandler = void 0;
const fs = require("fs");
const path_1 = require("path");
const rc_config_loader_1 = require("rc-config-loader");
const ui5plugin_parser_1 = require("ui5plugin-parser");
const UI5Version_1 = require("ui5plugin-parser/dist/classes/util/UI5Version");
const Linter_1 = require("../Linter");
class PackageLinterConfigHandler {
    static setGlobalConfigPath(fsPath) {
        this._globalConfig = JSON.parse(fs.readFileSync(fsPath, "utf8")) || {};
    }
    constructor(parser, packagePath = (0, path_1.join)(process.cwd(), "/package.json")) {
        this._cache = {};
        this._parser = parser;
        this.packagePath = (0, ui5plugin_parser_1.toNative)(packagePath);
        try {
            if (PackageLinterConfigHandler.configCache[this.packagePath]) {
                this._config = PackageLinterConfigHandler.configCache[this.packagePath];
            }
            else {
                const cwd = (0, path_1.dirname)(this.packagePath);
                const { config, filePath } = (0, rc_config_loader_1.rcFile)("ui5plugin", { cwd: cwd, packageJSON: { fieldName: "ui5" } }) ?? {
                    config: {}
                };
                if (filePath && (0, ui5plugin_parser_1.toNative)((0, path_1.dirname)(filePath)) === (0, ui5plugin_parser_1.toNative)(cwd)) {
                    this._config = filePath?.endsWith("package.json") ? { ui5: config } : config;
                    PackageLinterConfigHandler.configCache[this.packagePath] = this._config;
                    this.configPath = filePath;
                }
                else {
                    this._config = {};
                }
            }
        }
        catch (error) {
            this._config = {};
        }
    }
    getIfLintingShouldBeSkipped(document) {
        let shouldBeSkipped = false;
        const componentsToInclude = this._config.ui5?.ui5linter?.componentsToInclude ??
            PackageLinterConfigHandler._globalConfig?.ui5?.ui5linter?.componentsToInclude;
        const componentsToExclude = this._config.ui5?.ui5linter?.componentsToExclude ??
            PackageLinterConfigHandler._globalConfig?.ui5?.ui5linter?.componentsToExclude;
        const jsClassesToExclude = this._config.ui5?.ui5linter?.jsClassExceptions ??
            PackageLinterConfigHandler._globalConfig?.ui5?.ui5linter?.jsClassExceptions;
        const xmlClassesToExclude = this._config.ui5?.ui5linter?.xmlClassExceptions ??
            PackageLinterConfigHandler._globalConfig?.ui5?.ui5linter?.xmlClassExceptions;
        if (componentsToInclude || componentsToExclude || jsClassesToExclude || xmlClassesToExclude) {
            const className = this._parser.fileReader.getClassNameFromPath(document.fileName);
            if (className) {
                if (componentsToInclude || componentsToExclude) {
                    const manifest = ui5plugin_parser_1.ParserPool.getManifestForClass(className);
                    if (manifest?.componentName) {
                        if (componentsToInclude) {
                            shouldBeSkipped = !componentsToInclude.includes(manifest.componentName);
                        }
                        else if (componentsToExclude) {
                            shouldBeSkipped = componentsToExclude.includes(manifest.componentName);
                        }
                    }
                }
                if (!shouldBeSkipped &&
                    jsClassesToExclude &&
                    (document.fileName.endsWith(".js") || document.fileName.endsWith(".ts"))) {
                    shouldBeSkipped = jsClassesToExclude.includes(className);
                }
                if (!shouldBeSkipped && xmlClassesToExclude && document.fileName.endsWith(".xml")) {
                    shouldBeSkipped = xmlClassesToExclude.includes(className);
                }
            }
        }
        return shouldBeSkipped;
    }
    getSeverity(linter) {
        return (this._config.ui5?.ui5linter?.severity?.[linter] ??
            PackageLinterConfigHandler._globalConfig?.ui5?.ui5linter?.severity?.[linter] ??
            this._getDefaultSeverityFor(linter));
    }
    _getDefaultSeverityFor(linter) {
        const defaultSeverity = {
            WrongParametersLinter: Linter_1.Severity.Error,
            WrongOverrideLinter: Linter_1.Severity.Error,
            TagAttributeDefaultValueLinter: Linter_1.Severity.Information,
            WrongImportLinter: Linter_1.Severity.Warning,
            WrongFilePathLinter: Linter_1.Severity.Warning,
            WrongFieldMethodLinter: Linter_1.Severity.Warning,
            WrongClassNameLinter: Linter_1.Severity.Warning,
            UnusedTranslationsLinter: Linter_1.Severity.Information,
            UnusedNamespaceLinter: Linter_1.Severity.Error,
            UnusedMemberLinter: Linter_1.Severity.Information,
            TagLinter: Linter_1.Severity.Error,
            TagAttributeLinter: Linter_1.Severity.Error,
            PublicMemberLinter: Linter_1.Severity.Information,
            InterfaceLinter: Linter_1.Severity.Error,
            AbstractClassLinter: Linter_1.Severity.Error,
            UnusedClassLinter: Linter_1.Severity.Error,
            WrongNamespaceLinter: Linter_1.Severity.Warning,
            DuplicateTranslationLinter: Linter_1.Severity.Error,
            EventTypeLinter: Linter_1.Severity.Error
        };
        return defaultSeverity[linter];
    }
    getJSLinterExceptions() {
        const defaultExceptions = [
            {
                className: "sap.ui.core.Element",
                memberName: "getDomRef",
                applyToChildren: true
            },
            {
                className: "sap.ui.model.json.JSONModel",
                memberName: "iSizeLimit",
                applyToChildren: true
            },
            {
                className: "sap.ui.model.Binding",
                memberName: "*"
            },
            {
                className: "sap.ui.model.Model",
                memberName: "*"
            },
            {
                className: "sap.ui.core.Element",
                memberName: "*"
            },
            {
                className: "sap.ui.base.ManagedObject",
                memberName: "*"
            },
            {
                className: "sap.ui.core.Control",
                memberName: "*"
            },
            {
                className: "sap.ui.xmlfragment",
                memberName: "*"
            },
            {
                className: "*",
                memberName: "byId"
            },
            {
                className: "*",
                memberName: "prototype"
            },
            {
                className: "*",
                memberName: "call"
            },
            {
                className: "*",
                memberName: "apply"
            },
            {
                className: "*",
                memberName: "bind"
            },
            {
                className: "*",
                memberName: "constructor"
            },
            {
                className: "*",
                memberName: "init"
            },
            {
                className: "*",
                memberName: "exit"
            },
            {
                className: "map",
                memberName: "*"
            }
        ];
        const userExceptions = this._config.ui5?.ui5linter?.jsLinterExceptions ??
            PackageLinterConfigHandler._globalConfig?.ui5?.ui5linter?.jsLinterExceptions ??
            [];
        return defaultExceptions.concat(userExceptions);
    }
    getIdNamingPattern() {
        return (this._config.ui5?.ui5linter?.idNamingPattern ??
            PackageLinterConfigHandler._globalConfig?.ui5?.ui5linter?.idNamingPattern ??
            "^id{MeaningAssumption}.*?{ControlName}$");
    }
    getEventNamingPattern() {
        return (this._config.ui5?.ui5linter?.eventNamingPattern ??
            PackageLinterConfigHandler._globalConfig?.ui5?.ui5linter?.eventNamingPattern ??
            "^on{MeaningAssumption}{ControlName}.*?{EventName}$");
    }
    getAttributesToCheck() {
        return (this._config.ui5?.ui5linter?.attributesToCheck ??
            PackageLinterConfigHandler._globalConfig?.ui5?.ui5linter?.attributesToCheck ?? [
            "content",
            "items",
            "value",
            "text",
            "number"
        ]);
    }
    getLinterUsage(linter) {
        return (this._config.ui5?.ui5linter?.usage?.[linter] ??
            PackageLinterConfigHandler._globalConfig?.ui5?.ui5linter?.usage?.[linter] ??
            (linter === Linter_1.JSLinters.EventTypeLinter ? this._getIfLibraryVersionIsGreaterThan("1.115.1") : true));
    }
    _getIfLibraryVersionIsGreaterThan(expectedVersionText) {
        const currentVersionText = this._parser.configHandler.getUI5Version();
        const currentVersion = new UI5Version_1.default(currentVersionText);
        const expectedVersion = new UI5Version_1.default(expectedVersionText);
        return !currentVersion.isLesserThan(expectedVersion);
    }
    getPropertiesLinterExceptions() {
        return (this._config.ui5?.ui5linter?.propertiesLinterExceptions ??
            PackageLinterConfigHandler._globalConfig?.ui5?.ui5linter?.propertiesLinterExceptions ??
            []);
    }
    checkIfMemberIsException(className = "", memberName = "") {
        const cacheKey = [className, memberName].join(",");
        if (!this._cache[cacheKey]) {
            const hardcodedExceptions = ["metadata", "renderer", "onAfterRendering", "customMetadata"];
            const classExceptions = this.getJSLinterExceptions();
            const isException = hardcodedExceptions.includes(memberName) ||
                !!classExceptions.find(classException => {
                    let isException = (classException.className === className || classException.className === "*") &&
                        (classException.memberName === memberName || classException.memberName === "*");
                    if (!isException &&
                        classException.applyToChildren &&
                        (classException.memberName === memberName || classException.memberName === "*")) {
                        isException = this._parser.classFactory.isClassAChildOfClassB(className, classException.className);
                    }
                    if (!isException) {
                        isException = this._checkIfMemberIsEventHandler(memberName);
                    }
                    return isException;
                });
            this._cache[cacheKey] = isException;
        }
        return this._cache[cacheKey];
    }
    _checkIfMemberIsEventHandler(memberName) {
        if (memberName.length <= 3) {
            return false;
        }
        const chars = memberName.split("");
        const firstChars = chars.splice(0, 2).join("");
        const memberNameStartsWithOn = firstChars === "on";
        const restCharsAreLowerCase = chars.every(char => char.toLowerCase() === char);
        const isDomEventHandler = memberNameStartsWithOn && restCharsAreLowerCase;
        return isDomEventHandler;
    }
}
exports.PackageLinterConfigHandler = PackageLinterConfigHandler;
PackageLinterConfigHandler.configCache = {};
