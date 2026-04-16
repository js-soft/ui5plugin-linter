"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrongImportLinter = void 0;
const CustomJSClass_1 = require("ui5plugin-parser/dist/classes/parsing/ui5class/js/CustomJSClass");
const RangeAdapter_1 = require("ui5plugin-parser/dist/classes/parsing/util/range/adapters/RangeAdapter");
const Linter_1 = require("../../Linter");
const JSLinter_1 = require("./abstraction/JSLinter");
class WrongImportLinter extends JSLinter_1.JSLinter {
    constructor() {
        super(...arguments);
        this.className = Linter_1.JSLinters.WrongImportLinter;
    }
    _getErrors(document) {
        const errors = [];
        const className = this._parser.fileReader.getClassNameFromPath(document.fileName);
        if (className) {
            const UIClass = this._parser.classFactory.getUIClass(className);
            if (UIClass instanceof CustomJSClass_1.CustomJSClass && UIClass.UIDefine) {
                UIClass.UIDefine.forEach(UIDefine => {
                    const importedClass = this._parser.classFactory.getUIClass(UIDefine.classNameDotNotation);
                    if (!importedClass.classExists) {
                        //TODO: check location generation
                        const range = RangeAdapter_1.RangeAdapter.offsetsRange(UIClass.classText, UIDefine.start + 1, UIDefine.start + 1 + UIDefine.path.length);
                        if (range) {
                            errors.push({
                                acornNode: UIDefine.node,
                                code: "UI5Plugin",
                                className: UIClass.className,
                                source: this.className,
                                message: `Class "${UIDefine.classNameDotNotation}" doesn't exist`,
                                range: range,
                                severity: this._configHandler.getSeverity(this.className),
                                fsPath: document.fileName
                            });
                        }
                    }
                    else if (importedClass.deprecated) {
                        const range = RangeAdapter_1.RangeAdapter.offsetsRange(UIClass.classText, UIDefine.start + 1, UIDefine.start + 1 + UIDefine.path.length);
                        if (range) {
                            errors.push({
                                acornNode: UIDefine.node,
                                code: "UI5Plugin",
                                className: UIClass.className,
                                source: this.className,
                                message: `Class "${UIDefine.classNameDotNotation}" is deprecated`,
                                range: range,
                                severity: this._configHandler.getSeverity(this.className),
                                fsPath: document.fileName,
                                tags: [Linter_1.DiagnosticTag.Deprecated]
                            });
                        }
                    }
                });
            }
        }
        return errors;
    }
}
exports.WrongImportLinter = WrongImportLinter;
