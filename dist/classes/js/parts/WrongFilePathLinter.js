"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrongFilePathLinter = void 0;
const fs = require("fs");
const ui5plugin_parser_1 = require("ui5plugin-parser");
const AbstractCustomClass_1 = require("ui5plugin-parser/dist/classes/parsing/ui5class/AbstractCustomClass");
const CustomJSClass_1 = require("ui5plugin-parser/dist/classes/parsing/ui5class/js/CustomJSClass");
const EmptyJSClass_1 = require("ui5plugin-parser/dist/classes/parsing/ui5class/js/EmptyJSClass");
const CustomTSClass_1 = require("ui5plugin-parser/dist/classes/parsing/ui5class/ts/CustomTSClass");
const CustomTSObject_1 = require("ui5plugin-parser/dist/classes/parsing/ui5class/ts/CustomTSObject");
const RangeAdapter_1 = require("ui5plugin-parser/dist/classes/parsing/util/range/adapters/RangeAdapter");
const Linter_1 = require("../../Linter");
const JSLinter_1 = require("./abstraction/JSLinter");
class WrongFilePathLinter extends JSLinter_1.JSLinter {
    constructor() {
        super(...arguments);
        this.className = Linter_1.JSLinters.WrongFilePathLinter;
    }
    _getErrors(document) {
        const errors = [];
        const className = this._parser.fileReader.getClassNameFromPath(document.fileName);
        if (className) {
            const UIClass = this._parser.classFactory.getUIClass(className);
            if (UIClass instanceof AbstractCustomClass_1.AbstractCustomClass && UIClass.classText) {
                const manifest = ui5plugin_parser_1.ParserPool.getManifestForClass(UIClass.className);
                if (manifest) {
                    const rClassNamesRegex = new RegExp(`${manifest.componentName.replace(/\./g, "\\.")}\\.([a-zA-Z0-9_]|\\.)*?(?=("|'|\`|}|\\[|\\]|>|\\|))`, "g");
                    if (rClassNamesRegex) {
                        let result = rClassNamesRegex.exec(UIClass.classText);
                        while (result) {
                            const sClassName = result[0];
                            const isClassNameValid = this._validateClassName(sClassName);
                            if (!isClassNameValid) {
                                const positionBegin = result.index;
                                const positionEnd = positionBegin + sClassName.length;
                                const range = RangeAdapter_1.RangeAdapter.offsetsRange(UIClass.classText, positionBegin, positionEnd);
                                if (range) {
                                    errors.push({
                                        code: "UI5Plugin",
                                        className: UIClass.className,
                                        source: this.className,
                                        message: `Class "${sClassName}" doesn't exist`,
                                        range: range,
                                        severity: this._configHandler.getSeverity(this.className),
                                        fsPath: document.fileName
                                    });
                                }
                            }
                            result = rClassNamesRegex.exec(UIClass.classText);
                        }
                    }
                }
            }
        }
        return errors;
    }
    _validateClassName(className) {
        let isPathValid = false;
        const UIClass = this._parser.classFactory.getUIClass(className);
        if (UIClass && UIClass instanceof CustomJSClass_1.CustomJSClass) {
            isPathValid = UIClass.classExists;
        }
        else if (UIClass && UIClass instanceof EmptyJSClass_1.EmptyJSClass) {
            isPathValid = false;
        }
        else if (UIClass && (UIClass instanceof CustomTSClass_1.CustomTSClass || UIClass instanceof CustomTSObject_1.CustomTSObject)) {
            isPathValid = true;
        }
        if (!isPathValid) {
            const sFileFSPath = this._parser.fileReader.convertClassNameToFSPath(className, false, false, true);
            const aAllViews = ui5plugin_parser_1.ParserPool.getAllViews();
            const oView = aAllViews.find(oView => oView.fsPath === sFileFSPath);
            isPathValid = !!oView;
        }
        if (!isPathValid) {
            const sFileFSPath = this._parser.fileReader.convertClassNameToFSPath(className, false, true, false);
            const aAllFragments = ui5plugin_parser_1.ParserPool.getAllFragments();
            const oFragment = aAllFragments.find(oFragment => oFragment.fsPath === sFileFSPath);
            isPathValid = !!oFragment;
        }
        if (!isPathValid) {
            if (className.endsWith(".")) {
                className = className.substring(0, className.length - 1);
            }
            const sFileFSPath = this._parser.fileReader
                .convertClassNameToFSPath(className)
                ?.replace(".js", ".properties")
                .replace(".ts", ".properties");
            if (sFileFSPath) {
                isPathValid = fs.existsSync(sFileFSPath);
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
        if (!isPathValid) {
            const sFileFSPath = this._parser.fileReader.convertClassNameToFSPath(className);
            if (sFileFSPath) {
                isPathValid = fs.existsSync(sFileFSPath);
            }
        }
        return isPathValid;
    }
}
exports.WrongFilePathLinter = WrongFilePathLinter;
