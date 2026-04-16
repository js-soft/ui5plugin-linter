"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertiesLinterErrorFactory = void 0;
const Linter_1 = require("../Linter");
const UnusedTranslationsLinter_1 = require("./parts/UnusedTranslationsLinter");
const DuplicateTranslationLinter_1 = require("./parts/DuplicateTranslationLinter");
class PropertiesLinterErrorFactory extends Linter_1.Linter {
    getLintingErrors(document) {
        const linters = [
            new UnusedTranslationsLinter_1.UnusedTranslationsLinter(this._parser, this._configHandler),
            new DuplicateTranslationLinter_1.DuplicateTranslationLinter(this._parser, this._configHandler)
        ];
        let errors = [];
        try {
            for (const linter of linters) {
                errors = errors.concat(linter.getLintingErrors(document));
            }
        }
        catch (error) {
            console.error(error);
        }
        // copy(JSON.stringify(errors.map(error => ({text: error.message}))))
        return errors;
    }
}
exports.PropertiesLinterErrorFactory = PropertiesLinterErrorFactory;
