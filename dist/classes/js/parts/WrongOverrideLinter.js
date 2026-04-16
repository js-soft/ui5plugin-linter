"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrongOverrideLinter = void 0;
const CustomJSClass_1 = require("ui5plugin-parser/dist/classes/parsing/ui5class/js/CustomJSClass");
const RangeAdapter_1 = require("ui5plugin-parser/dist/classes/parsing/util/range/adapters/RangeAdapter");
const Linter_1 = require("../../Linter");
const JSLinter_1 = require("./abstraction/JSLinter");
class WrongOverrideLinter extends JSLinter_1.JSLinter {
    constructor() {
        super(...arguments);
        this.className = Linter_1.JSLinters.WrongOverrideLinter;
    }
    _getErrors(document) {
        const errors = [];
        const className = this._parser.fileReader.getClassNameFromPath(document.fileName);
        if (className) {
            const UIClass = this._parser.classFactory.getUIClass(className);
            if (UIClass instanceof CustomJSClass_1.CustomJSClass) {
                const fieldsAndMethods = [...UIClass.fields, ...UIClass.methods];
                fieldsAndMethods.forEach(fieldOrMethod => {
                    const error = this._getIfMemberIsWronglyOverriden(UIClass, fieldOrMethod);
                    if (error) {
                        errors.push(error);
                    }
                });
            }
        }
        return errors;
    }
    _getIfMemberIsWronglyOverriden(UIClass, UIMember) {
        let error;
        const parentMember = this._getMemberFromParent(UIClass, UIMember);
        if (parentMember?.visibility === "private" && UIMember.loc) {
            const range = RangeAdapter_1.RangeAdapter.acornLocationToRange(UIMember.loc);
            error = {
                message: `You can't override "${UIMember.name}" because it is a private member of class "${parentMember.owner}"`,
                code: "UI5Plugin",
                source: this.className,
                range: range,
                className: UIClass.className,
                acornNode: UIMember.node,
                methodName: UIMember.name,
                sourceClassName: UIClass.className,
                severity: this._configHandler.getSeverity(this.className),
                fsPath: UIClass.fsPath || ""
            };
        }
        else if (parentMember?.deprecated && UIMember.loc) {
            const range = RangeAdapter_1.RangeAdapter.acornLocationToRange(UIMember.loc);
            error = {
                message: `Member "${UIMember.name}" is deprecated`,
                code: "UI5Plugin",
                source: this.className,
                range: range,
                className: UIClass.className,
                acornNode: UIMember.node,
                methodName: UIMember.name,
                sourceClassName: UIClass.className,
                severity: this._configHandler.getSeverity(this.className),
                fsPath: UIClass.fsPath || ""
            };
        }
        return error;
    }
    _getMemberFromParent(UIClass, UIMember) {
        let parentMember;
        if (UIClass.parentClassNameDotNotation) {
            const UIClassParent = this._parser.classFactory.getUIClass(UIClass.parentClassNameDotNotation);
            const fieldsAndMethods = [...UIClassParent.fields, ...UIClassParent.methods];
            parentMember = fieldsAndMethods.find(parentMember => parentMember.name === UIMember.name);
            if (!parentMember && UIClassParent.parentClassNameDotNotation) {
                parentMember = this._getMemberFromParent(UIClassParent, UIMember);
            }
        }
        return parentMember;
    }
}
exports.WrongOverrideLinter = WrongOverrideLinter;
