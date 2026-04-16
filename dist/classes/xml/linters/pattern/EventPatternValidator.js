"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const APatternValidator_1 = require("./APatternValidator");
class EventPatternValidator extends APatternValidator_1.default {
    validateValue(eventHandler, data) {
        const expectedEventRegExp = this._assembleExpectedValueRegExp(data);
        if (eventHandler.includes(".")) {
            eventHandler = eventHandler.split(".").at(-1) ?? eventHandler;
        }
        if (!expectedEventRegExp.test(eventHandler)) {
            const message = `"${eventHandler}" should match pattern: "${expectedEventRegExp}"`;
            throw new Error(message);
        }
    }
    _assembleExpectedValueRegExp(data) {
        const [event, tag] = data;
        const eventNameUpperCamel = event.name
            ? event.name[0].toUpperCase() + event.name.substring(1, event.name.length)
            : "";
        const controlName = this._parser.xmlParser.getClassNameFromTag(tag.text);
        const meaningAssumption = this._generateMeaningAssumption(tag.attributes ?? []);
        const expectedIdWithReplacedVars = this._pattern
            .replace(/\{ControlName\}/g, controlName ?? "")
            .replace(/\{controlName\}/g, this._toFirstCharLower(controlName) ?? "")
            .replace(/\{EventName\}/g, eventNameUpperCamel ?? "")
            .replace(/\{eventName\}/g, this._toFirstCharLower(eventNameUpperCamel) ?? "")
            .replace(/\{MeaningAssumption\}/g, meaningAssumption ?? "")
            .replace(/\{meaningAssumption\}/g, this._toFirstCharLower(meaningAssumption) ?? "");
        const expectedId = expectedIdWithReplacedVars[0].toLowerCase() +
            expectedIdWithReplacedVars.substring(1, expectedIdWithReplacedVars.length);
        return new RegExp(expectedId);
    }
}
exports.default = EventPatternValidator;
