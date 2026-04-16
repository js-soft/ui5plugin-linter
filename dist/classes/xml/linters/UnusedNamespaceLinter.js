"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnusedNamespaceLinter = void 0;
const __1 = require("../../..");
const Linter_1 = require("../../Linter");
const XMLLinter_1 = require("./abstraction/XMLLinter");
class UnusedNamespaceLinter extends XMLLinter_1.XMLLinter {
    constructor() {
        super(...arguments);
        this.className = Linter_1.XMLLinters.UnusedNamespaceLinter;
    }
    _getErrors(document) {
        const errors = [];
        const documentText = document.getText();
        const documentClassName = this._parser.fileReader.getClassNameFromPath(document.fileName);
        const aPrefixes = documentText.match(/(?<=xmlns:).*?(?==)/g);
        aPrefixes?.forEach(prefix => {
            const aPrefixes = new RegExp(`(<|\\s)${prefix.trim()}:`, "g").exec(documentText);
            if (!aPrefixes || aPrefixes.length === 0) {
                const positionBegin = documentText.indexOf(`xmlns:${prefix}=`);
                const positionEnd = positionBegin + "xmlns:".length + prefix.length;
                const range = __1.RangeAdapter.offsetsRange(documentText, positionBegin, positionEnd);
                if (range) {
                    errors.push({
                        code: "UI5plugin",
                        message: "Unused namespace",
                        source: this.className,
                        tags: [Linter_1.DiagnosticTag.Unnecessary],
                        severity: this._configHandler.getSeverity(this.className),
                        range: range,
                        className: documentClassName || "",
                        fsPath: document.fileName
                    });
                }
            }
        });
        return errors;
    }
}
exports.UnusedNamespaceLinter = UnusedNamespaceLinter;
