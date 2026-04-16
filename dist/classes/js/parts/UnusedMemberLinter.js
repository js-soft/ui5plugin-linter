"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnusedMemberLinter = void 0;
const ui5plugin_parser_1 = require("ui5plugin-parser");
const AbstractCustomClass_1 = require("ui5plugin-parser/dist/classes/parsing/ui5class/AbstractCustomClass");
const CustomJSClass_1 = require("ui5plugin-parser/dist/classes/parsing/ui5class/js/CustomJSClass");
const RangeAdapter_1 = require("ui5plugin-parser/dist/classes/parsing/util/range/adapters/RangeAdapter");
const Linter_1 = require("../../Linter");
const JSLinter_1 = require("./abstraction/JSLinter");
class UnusedMemberLinter extends JSLinter_1.JSLinter {
    constructor() {
        super(...arguments);
        this.className = Linter_1.JSLinters.UnusedMemberLinter;
    }
    _getErrors(document) {
        const errors = [];
        // console.time("Unused Member Linter");
        const className = this._parser.fileReader.getClassNameFromPath(document.fileName);
        if (className) {
            const UIClass = this._parser.classFactory.getUIClass(className);
            if (UIClass instanceof AbstractCustomClass_1.AbstractCustomClass) {
                const methodsAndFields = [
                    ...UIClass.methods,
                    ...UIClass.fields
                ];
                methodsAndFields.forEach(methodOrField => {
                    const methodIsUsed = this._checkIfMemberIsUsed(UIClass, methodOrField);
                    if (!methodIsUsed && methodOrField.loc) {
                        const range = RangeAdapter_1.RangeAdapter.acornLocationToRange(methodOrField.loc);
                        errors.push({
                            source: this.className,
                            acornNode: methodOrField.node,
                            code: "UI5Plugin",
                            className: UIClass.className,
                            message: `No references found for "${methodOrField.name}" class member`,
                            range: range,
                            tags: [Linter_1.DiagnosticTag.Unnecessary],
                            severity: this._configHandler.getSeverity(this.className),
                            fsPath: document.fileName
                        });
                    }
                });
            }
        }
        // console.timeEnd("Unused Method Linter");
        return errors;
    }
    _checkIfMemberIsUsed(UIClass, member) {
        let memberIsUsed = member.ui5ignored ||
            member.mentionedInTheXMLDocument ||
            this._parser.classFactory.isMethodOverriden(UIClass.className, member.name) ||
            this._checkIfMethodIsException(UIClass.className, member.name);
        if (!memberIsUsed) {
            const referenceFinder = UIClass instanceof CustomJSClass_1.CustomJSClass
                ? new ui5plugin_parser_1.ReferenceFinder(this._parser)
                : new ui5plugin_parser_1.TSReferenceFinder(this._parser);
            const references = referenceFinder.getReferenceLocations(member);
            memberIsUsed = references.length > 0;
        }
        return memberIsUsed;
    }
    _checkIfMethodIsException(className, methodName) {
        return (this._configHandler.checkIfMemberIsException(className, methodName) ||
            this._checkIfThisIsStandardMethodFromPropertyEventAggregationAssociation(className, methodName));
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
exports.UnusedMemberLinter = UnusedMemberLinter;
