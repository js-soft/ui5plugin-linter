"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnusedTranslationsLinter = void 0;
const ui5plugin_parser_1 = require("ui5plugin-parser");
const ResourceModelData_1 = require("ui5plugin-parser/dist/classes/parsing/util/i18n/ResourceModelData");
const __1 = require("../../..");
const Linter_1 = require("../../Linter");
const PropertiesLinter_1 = require("./abstraction/PropertiesLinter");
class UnusedTranslationsLinter extends PropertiesLinter_1.PropertiesLinter {
    constructor() {
        super(...arguments);
        this.className = Linter_1.PropertiesLinters.UnusedTranslationsLinter;
    }
    _getErrors(document) {
        const errors = [];
        const className = this._parser.fileReader.getClassNameFromPath(document.fileName);
        if (className) {
            const manifest = ui5plugin_parser_1.ParserPool.getManifestForClass(className);
            const componentName = manifest?.componentName;
            if (componentName) {
                const translations = ResourceModelData_1.ResourceModelData.parseFile({
                    content: document.getText(),
                    componentName: componentName
                });
                translations.forEach(translation => {
                    errors.push(...this._getTranslationErrors(translation, document));
                });
            }
        }
        return errors;
    }
    _getTranslationErrors(translation, document) {
        const errors = [];
        const className = this._parser.fileReader.getClassNameFromPath(document.fileName);
        const translationId = translation.id;
        if (!this._getIfTranslationShouldBeSkipped(translation) && !this._getIfTranslationIsUsed(translationId)) {
            const range = __1.RangeAdapter.offsetsRange(document.getText(), translation.positionBegin, translation.positionEnd - 1);
            if (range) {
                errors.push({
                    code: "UI5plugin",
                    message: `Translation "${translationId}" is never used`,
                    source: this.className,
                    severity: this._configHandler.getSeverity(this.className),
                    tags: [Linter_1.DiagnosticTag.Unnecessary],
                    range: {
                        start: range.start,
                        end: { column: range.end.column + 1, line: range.end.line }
                    },
                    className: className || "",
                    fsPath: document.fileName
                });
            }
        }
        return errors;
    }
    _getIfTranslationShouldBeSkipped(translation) {
        const exceptions = this._configHandler.getPropertiesLinterExceptions();
        return translation.ui5ignored || exceptions.includes(translation.id);
    }
    _getIfTranslationIsUsed(translationId) {
        const UIClasses = ui5plugin_parser_1.ParserPool.getAllCustomUIClasses();
        let isUsed = !!UIClasses.find(UIClass => this._checkIfUsed(UIClass.classText, translationId));
        isUsed = isUsed || !!ui5plugin_parser_1.ParserPool.getAllViews().find(view => this._checkIfUsed(view.content, translationId));
        isUsed =
            isUsed ||
                !!ui5plugin_parser_1.ParserPool.getAllFragments().find(fragment => this._checkIfUsed(fragment.content, translationId));
        isUsed =
            isUsed ||
                !!ui5plugin_parser_1.ParserPool.getAllManifests().find(manifest => this._checkIfUsed(JSON.stringify(manifest.content), `{{${translationId}}}`));
        return isUsed;
    }
    _checkIfUsed(content, translationId) {
        const escapedTranslationId = escapeRegExp(translationId);
        const regExp = new RegExp(`(>|"|')${escapedTranslationId}(}|"|')`);
        return regExp.test(content);
    }
}
exports.UnusedTranslationsLinter = UnusedTranslationsLinter;
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
