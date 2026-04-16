"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplicateTranslationLinter = void 0;
const ui5plugin_parser_1 = require("ui5plugin-parser");
const ResourceModelData_1 = require("ui5plugin-parser/dist/classes/parsing/util/i18n/ResourceModelData");
const __1 = require("../../..");
const Linter_1 = require("../../Linter");
const PropertiesLinter_1 = require("./abstraction/PropertiesLinter");
class DuplicateTranslationLinter extends PropertiesLinter_1.PropertiesLinter {
    constructor() {
        super(...arguments);
        this.className = Linter_1.PropertiesLinters.DuplicateTranslationLinter;
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
                    errors.push(...this._getTranslationErrors(translation, translations, document));
                });
            }
        }
        return errors;
    }
    _getTranslationErrors(translation, translations, document) {
        const errors = [];
        const className = this._parser.fileReader.getClassNameFromPath(document.fileName);
        const translationId = translation.id;
        if (this._getIfTranslationIsDuplicated(translationId, translations)) {
            const range = __1.RangeAdapter.offsetsRange(document.getText(), translation.positionBegin, translation.positionEnd - 1);
            if (range) {
                errors.push({
                    code: "UI5plugin",
                    message: `Translation "${translationId}" is duplicated`,
                    source: this.className,
                    severity: this._configHandler.getSeverity(this.className),
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
    _getIfTranslationIsDuplicated(translationId, translations) {
        return !!translations.find(translation => translation.id === translationId)?.hasKeyCollisions;
    }
}
exports.DuplicateTranslationLinter = DuplicateTranslationLinter;
