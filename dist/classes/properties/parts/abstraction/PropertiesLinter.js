"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertiesLinter = void 0;
const Linter_1 = require("../../../Linter");
class PropertiesLinter extends Linter_1.Linter {
    constructor() {
        super(...arguments);
        this.timePerChar = 0;
    }
    getLintingErrors(document) {
        const errors = [];
        const timeStart = new Date().getTime();
        if (this._configHandler.getLinterUsage(this.className) &&
            !this._configHandler.getIfLintingShouldBeSkipped(document)) {
            errors.push(...this._getErrors(document));
            if (errors instanceof Promise) {
                errors.then(() => {
                    this._logTime(timeStart, document);
                });
            }
            else {
                this._logTime(timeStart, document);
            }
        }
        return errors;
    }
    _logTime(timeStart, document) {
        const timeEnd = new Date().getTime();
        const timeSpent = timeEnd - timeStart;
        this.timePerChar = timeSpent / document.getText().length;
        // console.log(`Time spent by ${this.className}: ${timeSpent}`);
    }
}
exports.PropertiesLinter = PropertiesLinter;
