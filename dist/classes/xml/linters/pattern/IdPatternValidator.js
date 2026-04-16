"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const APatternValidator_1 = require("./APatternValidator");
class IdPatternValidator extends APatternValidator_1.default {
    validateValue(actualId, tag) {
        const expectedIdRegExp = this._assembleExpectedValueRegExp(tag);
        if (!expectedIdRegExp.test(actualId)) {
            const message = `"${actualId}" should match pattern: "${expectedIdRegExp}"`;
            throw new Error(message);
        }
    }
    _assembleExpectedValueRegExp(tag) {
        const controlName = this._parser.xmlParser.getClassNameFromTag(tag.text);
        const meaningAssumption = this._generateMeaningAssumption(tag.attributes ?? []);
        const expectedIdWithReplacedVars = this._pattern
            .replace(/\{ControlName\}/g, controlName ?? "")
            .replace(/\{controlName\}/g, this._toFirstCharLower(controlName) ?? "")
            .replace(/\{MeaningAssumption\}/g, meaningAssumption ?? "")
            .replace(/\{meaningAssumption\}/g, this._toFirstCharLower(meaningAssumption) ?? "");
        const expectedId = expectedIdWithReplacedVars[0].toLowerCase() +
            expectedIdWithReplacedVars.substring(1, expectedIdWithReplacedVars.length);
        return new RegExp(expectedId);
    }
}
exports.default = IdPatternValidator;
