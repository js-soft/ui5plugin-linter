"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnusedClassLinter = void 0;
const ui5plugin_parser_1 = require("ui5plugin-parser");
const AbstractCustomClass_1 = require("ui5plugin-parser/dist/classes/parsing/ui5class/AbstractCustomClass");
const RangeAdapter_1 = require("ui5plugin-parser/dist/classes/parsing/util/range/adapters/RangeAdapter");
const Linter_1 = require("../../Linter");
const JSLinter_1 = require("./abstraction/JSLinter");
class UnusedClassLinter extends JSLinter_1.JSLinter {
    constructor() {
        super(...arguments);
        this.className = Linter_1.JSLinters.UnusedClassLinter;
    }
    _getErrors(document) {
        const errors = [];
        const className = this._parser.fileReader.getClassNameFromPath(document.fileName);
        if (className) {
            const UIClass = this._parser.classFactory.getUIClass(className);
            if (UIClass instanceof AbstractCustomClass_1.AbstractCustomClass) {
                const classIsUsed = this._checkIfClassIsUsed(UIClass);
                if (!classIsUsed) {
                    const range = RangeAdapter_1.RangeAdapter.acornPositionsToRange({ column: 0, line: 1 }, { column: 0, line: 1 });
                    errors.push({
                        source: this.className,
                        code: "UI5Plugin",
                        className: UIClass.className,
                        message: `No references found for "${className}" class`,
                        range: range,
                        severity: this._configHandler.getSeverity(this.className),
                        fsPath: document.fileName
                    });
                }
            }
        }
        return errors;
    }
    _checkIfClassIsUsed(UIClass) {
        const isException = this._checkClassForLintingExceptions(UIClass);
        const allCustomJSClasses = ui5plugin_parser_1.ParserPool.getAllCustomUIClasses();
        return (isException ||
            allCustomJSClasses.some(CustomJSClass => {
                return (this._checkIfClassIsImportedInUIDefine(CustomJSClass, UIClass) ||
                    this._checkIfClassIsUsedAsInterface(CustomJSClass, UIClass));
            }) ||
            this._checkIfClassMembersHasAnyReferencesOutside(UIClass) ||
            this._checkIfClassMentionedInManifest(UIClass) ||
            this._checkIfClassIsViewsController(UIClass) ||
            this._checkIfClassIsUsedInView(UIClass));
    }
    _checkIfClassMembersHasAnyReferencesOutside(UIClass) {
        const members = [...UIClass.methods, ...UIClass.fields];
        return members.some(member => this._getReferenceLocations(member).filter(location => location.filePath !== UIClass.fsPath).length > 0);
    }
    _getReferenceLocations(member) {
        if (this._parser instanceof ui5plugin_parser_1.UI5JSParser) {
            const referenceFinder = new ui5plugin_parser_1.ReferenceFinder(this._parser);
            return referenceFinder.getReferenceLocations(member);
        }
        if (this._parser instanceof ui5plugin_parser_1.UI5TSParser) {
            const referenceFinder = new ui5plugin_parser_1.TSReferenceFinder(this._parser);
            return referenceFinder.getReferenceLocations(member);
        }
        else {
            return [];
        }
    }
    _checkClassForLintingExceptions(UIClass) {
        return (UIClass.fsPath?.toLowerCase().endsWith("component.js") ||
            UIClass.fsPath?.toLowerCase().endsWith("component.ts") ||
            false);
    }
    _checkIfClassIsUsedInView(UIClass) {
        const isControlOrElement = this._parser.classFactory.isClassAChildOfClassB(UIClass.className, "sap.ui.core.Control") ||
            this._parser.classFactory.isClassAChildOfClassB(UIClass.className, "sap.ui.core.Element");
        if (!isControlOrElement) {
            return false;
        }
        const views = ui5plugin_parser_1.ParserPool.getAllViews();
        const fragments = ui5plugin_parser_1.ParserPool.getAllFragments();
        const XMLFiles = views.concat(fragments);
        const classNameLastPart = UIClass.className.split(".").pop();
        return (classNameLastPart &&
            XMLFiles.some(XMLFile => {
                if (XMLFile.content.indexOf(classNameLastPart) === -1) {
                    return false;
                }
                const tags = this._parser.xmlParser.getAllTags(XMLFile);
                return tags.some(tag => {
                    const className = this._parser.xmlParser.getFullClassNameFromTag(tag, XMLFile);
                    return className === UIClass.className;
                });
            }));
    }
    _checkIfClassIsUsedAsInterface(CustomJSClass, UIClass) {
        return CustomJSClass.interfaces.some(interfaceName => {
            return interfaceName === UIClass.className;
        });
    }
    _checkIfClassIsImportedInUIDefine(CustomJSClass, UIClass) {
        return CustomJSClass.UIDefine.some(UIDefine => {
            return UIDefine.classNameDotNotation === UIClass.className;
        });
    }
    _checkIfClassIsViewsController(UIClass) {
        if (UIClass.fsPath?.endsWith(".controller.js") || UIClass.fsPath?.endsWith(".controller.ts")) {
            return ui5plugin_parser_1.ParserPool.getAllViews().some(view => {
                return view.controllerName === UIClass.className;
            });
        }
        else {
            return false;
        }
    }
    _checkIfClassMentionedInManifest(UIClass) {
        const manifest = ui5plugin_parser_1.ParserPool.getManifestForClass(UIClass.className);
        let isMentionedInManifest = false;
        try {
            isMentionedInManifest = JSON.stringify(manifest?.content).indexOf(UIClass.className) > -1;
        }
        catch (error) {
            isMentionedInManifest = false;
        }
        return isMentionedInManifest;
    }
}
exports.UnusedClassLinter = UnusedClassLinter;
