"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractClassLinter = void 0;
const CustomJSClass_1 = require("ui5plugin-parser/dist/classes/parsing/ui5class/js/CustomJSClass");
const Linter_1 = require("../../Linter");
const JSLinter_1 = require("./abstraction/JSLinter");
class AbstractClassLinter extends JSLinter_1.JSLinter {
    constructor() {
        super(...arguments);
        this.className = Linter_1.JSLinters.AbstractClassLinter;
    }
    _getErrors(document) {
        const errors = [];
        const UIClass = this._parser.textDocumentTransformer.toCustomUIClass(document);
        if (UIClass?.parentClassNameDotNotation) {
            const parent = this._parser.classFactory.getParent(UIClass);
            if (parent?.abstract && parent instanceof CustomJSClass_1.CustomJSClass) {
                const undefinedMembers = [];
                const members = [...UIClass.methods, ...UIClass.fields];
                const parentMembers = [...parent.methods, ...parent.fields];
                const abstractMembers = parentMembers.filter(member => member.abstract);
                abstractMembers.forEach(abstractMember => {
                    const memberDefined = !!members.find(member => member.name === abstractMember.name);
                    if (!memberDefined) {
                        undefinedMembers.push(abstractMember);
                    }
                });
                undefinedMembers.forEach(member => {
                    errors.push({
                        source: this.className,
                        acornNode: null,
                        className: UIClass.className,
                        code: "UI5Plugin",
                        message: `Abstract class "${member.owner}" requires "${member.name}" member implementation`,
                        range: {
                            start: { line: 1, column: 0 },
                            end: { line: 1, column: 0 }
                        },
                        severity: this._configHandler.getSeverity(this.className),
                        fsPath: document.fileName
                    });
                });
            }
        }
        return errors;
    }
}
exports.AbstractClassLinter = AbstractClassLinter;
