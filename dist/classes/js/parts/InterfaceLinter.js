"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterfaceLinter = void 0;
const Linter_1 = require("../../Linter");
const JSLinter_1 = require("./abstraction/JSLinter");
class InterfaceLinter extends JSLinter_1.JSLinter {
    constructor() {
        super(...arguments);
        this.className = Linter_1.JSLinters.InterfaceLinter;
    }
    _getErrors(document) {
        const errors = [];
        const UIClass = this._parser.textDocumentTransformer.toCustomUIClass(document);
        if (UIClass?.interfaces && UIClass.interfaces.length > 0) {
            const interfaceMembers = UIClass.interfaces.flatMap(theInterface => [
                ...this._parser.classFactory.getClassMethods(theInterface, false),
                ...this._parser.classFactory.getClassFields(theInterface, false)
            ]);
            const undefinedMembers = [];
            const members = [...UIClass.methods, ...UIClass.fields];
            interfaceMembers.forEach(interfaceMember => {
                const memberDefined = !!members.find(member => member.name === interfaceMember.name);
                if (!memberDefined) {
                    undefinedMembers.push(interfaceMember);
                }
            });
            undefinedMembers.forEach(member => {
                errors.push({
                    source: this.className,
                    acornNode: null,
                    className: UIClass.className,
                    code: "UI5Plugin",
                    message: `Interface "${member.owner}" requires "${member.name}" member implementation`,
                    range: {
                        start: { line: 1, column: 0 },
                        end: { line: 1, column: 0 }
                    },
                    severity: this._configHandler.getSeverity(this.className),
                    fsPath: document.fileName
                });
            });
        }
        return errors;
    }
}
exports.InterfaceLinter = InterfaceLinter;
