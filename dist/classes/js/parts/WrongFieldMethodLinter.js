"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrongFieldMethodLinter = void 0;
const FieldsAndMethodForPositionBeforeCurrentStrategy_1 = require("ui5plugin-parser/dist/classes/parsing/jsparser/typesearch/FieldsAndMethodForPositionBeforeCurrentStrategy");
const CustomJSClass_1 = require("ui5plugin-parser/dist/classes/parsing/ui5class/js/CustomJSClass");
const RangeAdapter_1 = require("ui5plugin-parser/dist/classes/parsing/util/range/adapters/RangeAdapter");
const Linter_1 = require("../../Linter");
const JSLinter_1 = require("./abstraction/JSLinter");
class WrongFieldMethodLinter extends JSLinter_1.JSLinter {
    constructor() {
        super(...arguments);
        this.className = Linter_1.JSLinters.WrongFieldMethodLinter;
    }
    _getErrors(document) {
        return this._getLintingErrors(document);
    }
    _getLintingErrors(document) {
        let errors = [];
        const currentClassName = this._parser.fileReader.getClassNameFromPath(document.fileName);
        if (currentClassName) {
            const UIClass = this._parser.classFactory.getUIClass(currentClassName);
            if (UIClass instanceof CustomJSClass_1.CustomJSClass) {
                const acornMethods = UIClass.acornMethodsAndFields
                    .filter(fieldOrMethod => fieldOrMethod.value.type === "FunctionExpression")
                    .map((node) => node.value.body);
                acornMethods.forEach((method) => {
                    if (method.body) {
                        method.body.forEach((node) => {
                            const validationErrors = this._getErrorsForExpression(node, UIClass, document);
                            errors = errors.concat(validationErrors);
                        });
                    }
                });
            }
        }
        return errors;
    }
    _getErrorsForExpression(node, UIClass, document, errors = [], droppedNodes = [], errorNodes = []) {
        if (droppedNodes.includes(node)) {
            return [];
        }
        const currentClassName = UIClass.className;
        if (node.type === "MemberExpression") {
            const strategy = new FieldsAndMethodForPositionBeforeCurrentStrategy_1.FieldsAndMethodForPositionBeforeCurrentStrategy(this._parser.syntaxAnalyser, this._parser);
            const nodeStack = strategy.getStackOfNodesForPosition(currentClassName, node.end);
            if (nodeStack.length > 0) {
                const nodes = [];
                while (nodeStack.length > 0) {
                    let nextNode = nodeStack.shift();
                    nodes.push(nextNode);
                    nextNode = nodeStack[0];
                    if (nextNode?.type === "CallExpression") {
                        nextNode = nodeStack.shift();
                        nodes.push(nextNode);
                    }
                    const className = this._parser.syntaxAnalyser.findClassNameForStack(nodes.concat([]), currentClassName, currentClassName, true);
                    const isException = this._checkIfClassNameIsException(className);
                    if (!className || isException || (nextNode?.type === "Identifier" && nextNode?.name === "sap")) {
                        droppedNodes.push(...nodeStack);
                        break;
                    }
                    const classNames = className.split("|");
                    nextNode = nodeStack[0];
                    if (!nextNode) {
                        nextNode = node;
                    }
                    const nextNodeName = nextNode.property?.name;
                    const nodeText = UIClass.classText.substring(nextNode.start, nextNode.end);
                    if (!nodeText.endsWith("]") && !errorNodes.includes(nextNode)) {
                        const isMethodException = this._configHandler.checkIfMemberIsException(className, nextNodeName);
                        if (nextNodeName && !isMethodException) {
                            const singleFieldsAndMethods = this._getFieldsAndMethods(classNames, strategy, nextNode, nextNodeName);
                            if (!singleFieldsAndMethods) {
                                const isAnyMethodAnException = classNames.length > 0
                                    ? classNames.some(className => this._configHandler.checkIfMemberIsException(className, nextNodeName))
                                    : false;
                                if (!isAnyMethodAnException) {
                                    const shouldBreak = this._fillNonExistantMethodError(className, nextNodeName, nextNode, errorNodes, errors, UIClass, document);
                                    if (shouldBreak) {
                                        break;
                                    }
                                }
                            }
                            else {
                                const shouldBreak = this._fillAccessLevelModifierErrors(singleFieldsAndMethods, nextNodeName, document, nextNode, errorNodes, errors, UIClass, className);
                                if (shouldBreak) {
                                    break;
                                }
                                else {
                                    this._fillDeprecationErrors(singleFieldsAndMethods, nextNodeName, nextNode, errorNodes, errors, UIClass, className, document);
                                }
                            }
                        }
                    }
                    else if (nodeText.endsWith("]")) {
                        droppedNodes.push(nextNode);
                        if (nextNode.property) {
                            droppedNodes.push(nextNode.property);
                        }
                        break;
                    }
                }
            }
        }
        const innerNodes = this._parser.syntaxAnalyser.getContent(node);
        if (innerNodes) {
            innerNodes.forEach((node) => this._getErrorsForExpression(node, UIClass, document, errors, droppedNodes, errorNodes));
        }
        return errors;
    }
    _fillDeprecationErrors(singleFieldsAndMethods, nextNodeName, nextNode, errorNodes, errors, UIClass, className, document) {
        const isMethodException = this._configHandler.checkIfMemberIsException(className, nextNodeName);
        if (!isMethodException) {
            const allMembers = [...singleFieldsAndMethods.fields, ...singleFieldsAndMethods.methods];
            const member = allMembers.find(member => member.name === nextNodeName);
            if (member?.deprecated) {
                const range = RangeAdapter_1.RangeAdapter.acornLocationToRange(nextNode.property.loc);
                errorNodes.push(nextNode);
                errors.push({
                    message: `"${nextNodeName}" is deprecated`,
                    code: "UI5Plugin",
                    source: this.className,
                    range: range,
                    acornNode: nextNode,
                    className: UIClass.className,
                    tags: [Linter_1.DiagnosticTag.Deprecated],
                    methodName: nextNodeName,
                    sourceClassName: className,
                    severity: this._configHandler.getSeverity(this.className),
                    fsPath: document.fileName
                });
            }
        }
    }
    _fillNonExistantMethodError(className, nextNodeName, nextNode, errorNodes, errors, UIClass, document) {
        let shouldBreak = false;
        if (className.includes("__map__")) {
            className = "map";
        }
        const isMethodException = this._configHandler.checkIfMemberIsException(className, nextNodeName);
        if (!isMethodException) {
            const range = RangeAdapter_1.RangeAdapter.acornLocationToRange(nextNode.property.loc);
            errorNodes.push(nextNode);
            errors.push({
                message: `"${nextNodeName}" does not exist in "${className}"`,
                code: "UI5Plugin",
                source: this.className,
                range: range,
                acornNode: nextNode,
                className: UIClass.className,
                type: Linter_1.CustomDiagnosticType.NonExistentMethod,
                methodName: nextNodeName,
                sourceClassName: className,
                severity: this._configHandler.getSeverity(this.className),
                fsPath: document.fileName
            });
            shouldBreak = true;
        }
        return shouldBreak;
    }
    _fillAccessLevelModifierErrors(singleFieldsAndMethods, nextNodeName, document, nextNode, errorNodes, errors, UIClass, className) {
        let shouldBreak = false;
        const member = singleFieldsAndMethods.fields.find(field => field.name === nextNodeName) ||
            singleFieldsAndMethods.methods.find(method => method.name === nextNodeName);
        const isIgnored = !!member?.ui5ignored;
        if (!isIgnored) {
            let sErrorMessage = "";
            if (member?.visibility === "protected") {
                const currentDocumentClassName = this._parser.fileReader.getClassNameFromPath(document.fileName);
                if (currentDocumentClassName &&
                    !this._parser.classFactory.isClassAChildOfClassB(currentDocumentClassName, singleFieldsAndMethods.className)) {
                    sErrorMessage = `"${nextNodeName}" is a protected member of class "${member.owner}"`;
                }
            }
            else if (member?.visibility === "private") {
                const currentDocumentClassName = this._parser.fileReader.getClassNameFromPath(document.fileName);
                if (currentDocumentClassName && member.owner !== currentDocumentClassName) {
                    sErrorMessage = `"${nextNodeName}" is a private member of class "${member.owner}"`;
                }
            }
            if (sErrorMessage) {
                const range = RangeAdapter_1.RangeAdapter.acornLocationToRange(nextNode.property.loc);
                errorNodes.push(nextNode);
                errors.push({
                    message: sErrorMessage,
                    code: "UI5Plugin",
                    source: this.className,
                    range: range,
                    acornNode: nextNode,
                    methodName: nextNodeName,
                    className: UIClass.className,
                    sourceClassName: className,
                    severity: this._configHandler.getSeverity(this.className),
                    fsPath: document.fileName
                });
                shouldBreak = true;
            }
        }
        return shouldBreak;
    }
    _getFieldsAndMethods(classNames, strategy, nextNode, nextNodeName) {
        const fieldsAndMethods = classNames.map(className => strategy.destructureFieldsAndMethodsAccordingToMapParams(className));
        const singleFieldsAndMethods = fieldsAndMethods.find(fieldsAndMethods => {
            if (nextNode && fieldsAndMethods && nextNodeName) {
                const method = fieldsAndMethods.methods.find(method => method.name === nextNodeName);
                const field = fieldsAndMethods.fields.find(field => field.name === nextNodeName);
                return method || field;
            }
            return false;
        });
        return singleFieldsAndMethods;
    }
    _checkIfClassNameIsException(className = "") {
        let isException = false;
        const exceptions = ["void", "any", "array"];
        if (className.split(".").length === 1) {
            isException = true;
        }
        else if (exceptions.includes(className)) {
            isException = true;
        }
        return isException;
    }
}
exports.WrongFieldMethodLinter = WrongFieldMethodLinter;
WrongFieldMethodLinter.timePerChar = 0;
