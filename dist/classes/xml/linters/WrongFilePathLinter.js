"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrongFilePathLinter = void 0;
const fs = require("fs");
const ui5plugin_parser_1 = require("ui5plugin-parser");
const AbstractCustomClass_1 = require("ui5plugin-parser/dist/classes/parsing/ui5class/AbstractCustomClass");
const EmptyJSClass_1 = require("ui5plugin-parser/dist/classes/parsing/ui5class/js/EmptyJSClass");
const __1 = require("../../..");
const Linter_1 = require("../../Linter");
const XMLLinter_1 = require("./abstraction/XMLLinter");
class WrongFilePathLinter extends XMLLinter_1.XMLLinter {
    constructor() {
        super(...arguments);
        this.className = Linter_1.XMLLinters.WrongFilePathLinter;
    }
    _getErrors(document) {
        const errors = [];
        const documentClassName = this._parser.fileReader.getClassNameFromPath(document.fileName) || "";
        const XMLFile = this._parser.textDocumentTransformer.toXMLFile(document);
        if (XMLFile) {
            const manifest = ui5plugin_parser_1.ParserPool.getManifestForClass(XMLFile.name);
            if (manifest) {
                const rClassNamesRegex = new RegExp(`${manifest.componentName.replace(/\./, "\\.")}\\..*?(?="|')`, "g");
                if (rClassNamesRegex) {
                    let result = rClassNamesRegex.exec(XMLFile.content);
                    while (result) {
                        const sClassName = result[0];
                        const isClassNameValid = this._validateClassName(sClassName);
                        if (!isClassNameValid) {
                            const range = __1.RangeAdapter.offsetsRange(XMLFile.content, result.index, result.index + sClassName.length);
                            if (range) {
                                errors.push({
                                    code: "UI5Plugin",
                                    source: this.className,
                                    message: `View or fragment "${sClassName}" doesn't exist`,
                                    range: range,
                                    severity: this._configHandler.getSeverity(this.className),
                                    className: documentClassName,
                                    fsPath: XMLFile.fsPath
                                });
                            }
                        }
                        result = rClassNamesRegex.exec(XMLFile.content);
                    }
                }
            }
        }
        return errors;
    }
    _validateClassName(className) {
        let isPathValid = !!this._parser.fileReader.getXMLFile(className);
        if (!isPathValid) {
            let UIClass = this._parser.classFactory.getUIClass(className);
            if (UIClass instanceof AbstractCustomClass_1.AbstractCustomClass || UIClass instanceof EmptyJSClass_1.EmptyJSClass) {
                if (UIClass instanceof AbstractCustomClass_1.AbstractCustomClass) {
                    isPathValid = UIClass.classExists;
                }
                if (!isPathValid) {
                    const parts = className.split(".");
                    if (parts.length >= 2) {
                        const memberName = parts.pop();
                        const className = parts.join(".");
                        UIClass = this._parser.classFactory.getUIClass(className);
                        if (UIClass.classExists) {
                            isPathValid =
                                !!UIClass.methods.find(method => method.name === memberName) ||
                                    !!UIClass.fields.find(field => field.name === memberName);
                        }
                    }
                }
            }
        }
        if (!isPathValid) {
            if (className.endsWith(".")) {
                className = className.substring(0, className.length - 1);
            }
            const sFileFSPath = this._parser.fileReader
                .convertClassNameToFSPath(className)
                ?.replace(".js", "")
                .replace(".ts", "");
            if (sFileFSPath) {
                isPathValid = fs.existsSync(sFileFSPath);
            }
        }
        return isPathValid;
    }
}
exports.WrongFilePathLinter = WrongFilePathLinter;
