"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XMLLinter = void 0;
const Linter_1 = require("../../../Linter");
class XMLLinter extends Linter_1.Linter {
    constructor() {
        super(...arguments);
        this.timePerChar = 0;
    }
    getLintingErrors(document) {
        const errors = [];
        const timeStart = new Date().getTime();
        if (this._configHandler.getLinterUsage(this.className) &&
            !this._configHandler.getIfLintingShouldBeSkipped(document)) {
            try {
                errors.push(...this._getErrors(document));
                this._logTime(timeStart, document);
            }
            catch (error) {
                console.error(error);
                console.error(`Failed to lint ${document.fileName}, error: ${error.message}`);
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
exports.XMLLinter = XMLLinter;
