"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TSLinterErrorFactory = void 0;
const Linter_1 = require("../Linter");
const EventTypeLinter_1 = require("./parts/EventTypeLinter");
const PublicMemberLinter_1 = require("./parts/PublicMemberLinter");
const UnusedClassLinter_1 = require("./parts/UnusedClassLinter");
const UnusedMemberLinter_1 = require("./parts/UnusedMemberLinter");
const WrongClassNameLinter_1 = require("./parts/WrongClassNameLinter");
const WrongFilePathLinter_1 = require("./parts/WrongFilePathLinter");
const WrongNamespaceLinter_1 = require("./parts/WrongNamespaceLinter");
class TSLinterErrorFactory extends Linter_1.Linter {
    constructor() {
        super(...arguments);
        this.timePerchar = 0;
    }
    getLintingErrors(document) {
        const linters = [
            new UnusedMemberLinter_1.UnusedMemberLinter(this._parser, this._configHandler),
            new WrongFilePathLinter_1.WrongFilePathLinter(this._parser, this._configHandler),
            new UnusedClassLinter_1.UnusedClassLinter(this._parser, this._configHandler),
            new WrongClassNameLinter_1.WrongClassNameLinter(this._parser, this._configHandler),
            new WrongNamespaceLinter_1.WrongNamespaceLinter(this._parser, this._configHandler),
            new PublicMemberLinter_1.PublicMemberLinter(this._parser, this._configHandler),
            new EventTypeLinter_1.EventTypeLinter(this._parser, this._configHandler)
        ];
        const errors = linters.flatMap(linter => linter.getLintingErrors(document));
        return errors;
    }
}
exports.TSLinterErrorFactory = TSLinterErrorFactory;
