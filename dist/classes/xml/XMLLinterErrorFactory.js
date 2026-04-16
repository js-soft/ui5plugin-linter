"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XMLLinterErrorFactory = void 0;
const Linter_1 = require("../Linter");
const TagAttributeLinter_1 = require("./linters/TagAttributeLinter");
const TagLinter_1 = require("./linters/TagLinter");
const UnusedNamespaceLinter_1 = require("./linters/UnusedNamespaceLinter");
const WrongFilePathLinter_1 = require("./linters/WrongFilePathLinter");
class XMLLinterErrorFactory extends Linter_1.Linter {
    constructor() {
        super(...arguments);
        this.timePerchar = 0;
    }
    getLintingErrors(document) {
        const linters = [
            new TagAttributeLinter_1.TagAttributeLinter(this._parser, this._configHandler),
            new TagLinter_1.TagLinter(this._parser, this._configHandler),
            new UnusedNamespaceLinter_1.UnusedNamespaceLinter(this._parser, this._configHandler),
            new WrongFilePathLinter_1.WrongFilePathLinter(this._parser, this._configHandler)
        ];
        const errors = linters.flatMap(linter => linter.getLintingErrors(document));
        return errors;
    }
}
exports.XMLLinterErrorFactory = XMLLinterErrorFactory;
