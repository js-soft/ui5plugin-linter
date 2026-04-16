"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrongClassNameLinter = void 0;
const path = require("path");
const CustomJSClass_1 = require("ui5plugin-parser/dist/classes/parsing/ui5class/js/CustomJSClass");
const CustomTSClass_1 = require("ui5plugin-parser/dist/classes/parsing/ui5class/ts/CustomTSClass");
const RangeAdapter_1 = require("ui5plugin-parser/dist/classes/parsing/util/range/adapters/RangeAdapter");
const Linter_1 = require("../../Linter");
const JSLinter_1 = require("./abstraction/JSLinter");
class WrongClassNameLinter extends JSLinter_1.JSLinter {
    constructor() {
        super(...arguments);
        this.className = Linter_1.JSLinters.WrongClassNameLinter;
    }
    _getErrors(document) {
        const errors = [];
        const className = this._parser.fileReader.getClassNameFromPath(document.fileName);
        if (className) {
            const UIClass = this._parser.classFactory.getUIClass(className);
            if (UIClass instanceof CustomJSClass_1.CustomJSClass && UIClass.getUIDefineAcornBody()) {
                if (UIClass.acornReturnedClassExtendBody) {
                    const classNameFromFile = UIClass.acornReturnedClassExtendBody &&
                        UIClass.acornReturnedClassExtendBody.arguments &&
                        UIClass.acornReturnedClassExtendBody.arguments[0]?.value;
                    if (classNameFromFile && className !== classNameFromFile) {
                        const range = RangeAdapter_1.RangeAdapter.acornLocationToRange(UIClass.acornReturnedClassExtendBody?.arguments[0].loc);
                        errors.push({
                            source: this.className,
                            className: UIClass.className,
                            acornNode: UIClass.acornReturnedClassExtendBody.arguments[0],
                            code: "UI5Plugin",
                            message: `Invalid class name. Expected: "${className}", actual: "${classNameFromFile}"`,
                            range: range,
                            severity: this._configHandler.getSeverity(this.className),
                            fsPath: document.fileName
                        });
                    }
                }
            }
            else if (UIClass instanceof CustomTSClass_1.CustomTSClass) {
                const nameNode = UIClass.node.getNameNode();
                const className = nameNode?.getText();
                const fileName = document.fileName.replace(".ts", "").replace(".controller", "").split(path.sep).pop();
                if (nameNode && className && fileName && fileName !== className) {
                    const positionStart = UIClass.node.getSourceFile().getLineAndColumnAtPos(nameNode.getStart() - 1);
                    const positionEnd = UIClass.node.getSourceFile().getLineAndColumnAtPos(nameNode.getEnd() - 1);
                    const range = RangeAdapter_1.RangeAdapter.acornLocationToRange({ start: positionStart, end: positionEnd });
                    errors.push({
                        source: this.className,
                        className: UIClass.className,
                        acornNode: UIClass.node,
                        code: "UI5Plugin",
                        message: `Invalid class name. Expected: "${fileName}", actual: "${className}"`,
                        range: range,
                        severity: this._configHandler.getSeverity(this.className),
                        fsPath: document.fileName
                    });
                }
            }
        }
        return errors;
    }
}
exports.WrongClassNameLinter = WrongClassNameLinter;
