"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSLinterErrorFactory = void 0;
const Linter_1 = require("../Linter");
const AbstractClassLinter_1 = require("./parts/AbstractClassLinter");
const InterfaceLinter_1 = require("./parts/InterfaceLinter");
const PublicMemberLinter_1 = require("./parts/PublicMemberLinter");
const UnusedClassLinter_1 = require("./parts/UnusedClassLinter");
const UnusedMemberLinter_1 = require("./parts/UnusedMemberLinter");
const WrongClassNameLinter_1 = require("./parts/WrongClassNameLinter");
const WrongFieldMethodLinter_1 = require("./parts/WrongFieldMethodLinter");
const WrongFilePathLinter_1 = require("./parts/WrongFilePathLinter");
const WrongImportLinter_1 = require("./parts/WrongImportLinter");
const WrongOverrideLinter_1 = require("./parts/WrongOverrideLinter");
const WrongParametersLinter_1 = require("./parts/WrongParametersLinter");
class JSLinterErrorFactory extends Linter_1.Linter {
    constructor() {
        super(...arguments);
        this.timePerchar = 0;
    }
    getLintingErrors(document) {
        const linters = [
            new WrongFieldMethodLinter_1.WrongFieldMethodLinter(this._parser, this._configHandler),
            new WrongClassNameLinter_1.WrongClassNameLinter(this._parser, this._configHandler),
            new WrongImportLinter_1.WrongImportLinter(this._parser, this._configHandler),
            new WrongParametersLinter_1.WrongParametersLinter(this._parser, this._configHandler),
            new UnusedMemberLinter_1.UnusedMemberLinter(this._parser, this._configHandler),
            new WrongFilePathLinter_1.WrongFilePathLinter(this._parser, this._configHandler),
            new PublicMemberLinter_1.PublicMemberLinter(this._parser, this._configHandler),
            new WrongOverrideLinter_1.WrongOverrideLinter(this._parser, this._configHandler),
            new AbstractClassLinter_1.AbstractClassLinter(this._parser, this._configHandler),
            new InterfaceLinter_1.InterfaceLinter(this._parser, this._configHandler),
            new UnusedClassLinter_1.UnusedClassLinter(this._parser, this._configHandler)
        ];
        const errors = linters.flatMap(linter => linter.getLintingErrors(document));
        return errors;
    }
}
exports.JSLinterErrorFactory = JSLinterErrorFactory;
