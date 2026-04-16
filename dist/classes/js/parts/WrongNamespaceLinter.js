"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrongNamespaceLinter = void 0;
const CustomTSClass_1 = require("ui5plugin-parser/dist/classes/parsing/ui5class/ts/CustomTSClass");
const RangeAdapter_1 = require("ui5plugin-parser/dist/classes/parsing/util/range/adapters/RangeAdapter");
const Linter_1 = require("../../Linter");
const JSLinter_1 = require("./abstraction/JSLinter");
class WrongNamespaceLinter extends JSLinter_1.JSLinter {
    constructor() {
        super(...arguments);
        this.className = Linter_1.JSLinters.WrongNamespaceLinter;
    }
    _getErrors(document) {
        const errors = [];
        const className = this._parser.fileReader.getClassNameFromPath(document.fileName);
        if (className) {
            const UIClass = this._parser.classFactory.getUIClass(className);
            if (UIClass instanceof CustomTSClass_1.CustomTSClass) {
                const jsDocWithNamespaceTag = UIClass.node
                    .getJsDocs()
                    .find(JSDoc => JSDoc.getTags().find(tag => tag.getTagName() === "namespace"));
                const namespaceJSDoc = jsDocWithNamespaceTag?.getTags().find(tag => tag.getTagName() === "namespace");
                if (namespaceJSDoc) {
                    const actualNamespace = namespaceJSDoc.getComment();
                    const classNameParts = UIClass.className.split(".");
                    classNameParts.pop();
                    const expectedNamespace = classNameParts.join(".");
                    if (typeof actualNamespace === "string" && actualNamespace !== expectedNamespace) {
                        const range = RangeAdapter_1.RangeAdapter.offsetsRange(document.getText(), namespaceJSDoc.getStart(), namespaceJSDoc.getEnd());
                        if (range) {
                            errors.push({
                                acornNode: UIClass.node,
                                code: "UI5Plugin",
                                className: UIClass.className,
                                source: this.className,
                                message: `Invalid namespace. Expected "${expectedNamespace}", but got "${actualNamespace}"`,
                                range: range,
                                severity: this._configHandler.getSeverity(this.className),
                                fsPath: document.fileName
                            });
                        }
                    }
                }
                else {
                    const classNameParts = UIClass.className.split(".");
                    classNameParts.pop();
                    const expectedNamespace = classNameParts.join(".");
                    const range = RangeAdapter_1.RangeAdapter.offsetsRange(document.getText(), UIClass.node.getStart(), UIClass.node.getEnd());
                    if (range) {
                        errors.push({
                            acornNode: UIClass.node,
                            code: "UI5Plugin",
                            className: UIClass.className,
                            source: this.className,
                            message: `Expected namespace JSDoc: "${expectedNamespace}"`,
                            range: range,
                            severity: this._configHandler.getSeverity(this.className),
                            fsPath: document.fileName
                        });
                    }
                }
            }
        }
        return errors;
    }
}
exports.WrongNamespaceLinter = WrongNamespaceLinter;
