"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicMemberLinter = void 0;
const ui5plugin_parser_1 = require("ui5plugin-parser");
const AbstractCustomClass_1 = require("ui5plugin-parser/dist/classes/parsing/ui5class/AbstractCustomClass");
const CustomJSClass_1 = require("ui5plugin-parser/dist/classes/parsing/ui5class/js/CustomJSClass");
const __1 = require("../../..");
const Linter_1 = require("../../Linter");
const JSLinter_1 = require("./abstraction/JSLinter");
class PublicMemberLinter extends JSLinter_1.JSLinter {
    constructor() {
        super(...arguments);
        this.className = Linter_1.JSLinters.PublicMemberLinter;
    }
    _getErrors(document) {
        const errors = [];
        const className = this._parser.fileReader.getClassNameFromPath(document.fileName);
        if (className) {
            const UIClass = this._parser.classFactory.getUIClass(className);
            if (UIClass instanceof AbstractCustomClass_1.AbstractCustomClass) {
                const publicMethods = UIClass.methods.filter(method => method.visibility === "public");
                const publicFields = UIClass.fields.filter(field => field.visibility === "public");
                publicMethods.forEach(method => {
                    const isException = this._checkIfMemberIsException(UIClass.className, method.name);
                    if (!isException) {
                        const methodIsUsed = this._checkIfMemberIsUsedElsewhere(UIClass, method);
                        if (!methodIsUsed && method.position && method.loc) {
                            errors.push({
                                source: this.className,
                                acornNode: method.node,
                                code: "UI5Plugin",
                                className: UIClass.className,
                                message: `Method "${method.name}" is possibly private, no references found in other classes`,
                                range: __1.RangeAdapter.acornLocationToRange(method.loc),
                                severity: this._configHandler.getSeverity(this.className),
                                fsPath: document.fileName
                            });
                        }
                    }
                });
                publicFields.forEach(field => {
                    const isException = this._checkIfMemberIsException(UIClass.className, field.name);
                    if (!isException) {
                        const fieldIsUsed = this._checkIfMemberIsUsedElsewhere(UIClass, field);
                        if (!fieldIsUsed && field.loc) {
                            const range = __1.RangeAdapter.acornLocationToRange(field.loc);
                            errors.push({
                                source: this.className,
                                acornNode: field.node,
                                code: "UI5Plugin",
                                className: UIClass.className,
                                message: `Field "${field.name}" is possibly private, no references found in other classes`,
                                range: range,
                                severity: this._configHandler.getSeverity(this.className),
                                fsPath: document.fileName
                            });
                        }
                    }
                });
            }
        }
        return errors;
    }
    _checkIfMemberIsUsedElsewhere(UIClass, member) {
        let memberIsUsed = member.ui5ignored ||
            member.mentionedInTheXMLDocument ||
            this._parser.classFactory.isMethodOverriden(UIClass.className, member.name) ||
            this._checkIfMemberIsException(UIClass.className, member.name);
        if (!memberIsUsed) {
            const referenceFinder = UIClass instanceof CustomJSClass_1.CustomJSClass
                ? new ui5plugin_parser_1.ReferenceFinder(this._parser)
                : new ui5plugin_parser_1.TSReferenceFinder(this._parser);
            const references = referenceFinder.getReferenceLocations(member).filter(reference => {
                return reference.filePath !== UIClass.fsPath;
            });
            memberIsUsed = references.length > 0;
        }
        return memberIsUsed;
    }
    _checkIfMemberIsException(className, memberName) {
        return (this._configHandler.checkIfMemberIsException(className, memberName) ||
            this._checkIfThisIsStandardMethodFromPropertyEventAggregationAssociation(className, memberName));
    }
    _checkIfThisIsStandardMethodFromPropertyEventAggregationAssociation(className, methodName) {
        const startsWith = [
            "set",
            "get",
            "add",
            "remove",
            "removeAll",
            "insert",
            "indexOf",
            "destroy",
            "bind",
            "unbind"
        ];
        const isStandartMethod = !!startsWith.find(standartMethodStartsWith => {
            let isStandartMethod = false;
            if (methodName.startsWith(standartMethodStartsWith)) {
                const memberNameCapital = methodName.replace(standartMethodStartsWith, "");
                if (memberNameCapital) {
                    const memberName = `${memberNameCapital[0].toLowerCase()}${memberNameCapital.substring(1, memberNameCapital.length)}`;
                    const events = this._parser.classFactory.getClassEvents(className);
                    isStandartMethod = !!events.find(event => event.name === memberName);
                    if (!isStandartMethod) {
                        const properties = this._parser.classFactory.getClassProperties(className);
                        isStandartMethod = !!properties.find(property => property.name === memberName);
                    }
                    if (!isStandartMethod) {
                        const aggregations = this._parser.classFactory.getClassAggregations(className);
                        isStandartMethod = !!aggregations.find(aggregation => aggregation.name === memberName);
                    }
                    if (!isStandartMethod) {
                        const associations = this._parser.classFactory.getClassAssociations(className);
                        isStandartMethod = !!associations.find(association => association.name === memberName);
                    }
                }
            }
            return isStandartMethod;
        });
        return isStandartMethod;
    }
}
exports.PublicMemberLinter = PublicMemberLinter;
