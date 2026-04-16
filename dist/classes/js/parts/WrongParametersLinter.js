"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrongParametersLinter = void 0;
const FieldsAndMethodForPositionBeforeCurrentStrategy_1 = require("ui5plugin-parser/dist/classes/parsing/jsparser/typesearch/FieldsAndMethodForPositionBeforeCurrentStrategy");
const CustomJSClass_1 = require("ui5plugin-parser/dist/classes/parsing/ui5class/js/CustomJSClass");
const RangeAdapter_1 = require("ui5plugin-parser/dist/classes/parsing/util/range/adapters/RangeAdapter");
const Linter_1 = require("../../Linter");
const JSLinter_1 = require("./abstraction/JSLinter");
class WrongParametersLinter extends JSLinter_1.JSLinter {
    constructor() {
        super(...arguments);
        this.className = Linter_1.JSLinters.WrongParametersLinter;
    }
    _getErrors(document) {
        const errors = [];
        // console.time("WrongParameterLinter");
        const start = new Date().getTime();
        const className = this._parser.fileReader.getClassNameFromPath(document.fileName);
        if (className) {
            const UIClass = this._parser.classFactory.getUIClass(className);
            if (UIClass instanceof CustomJSClass_1.CustomJSClass && UIClass.acornClassBody) {
                UIClass.acornClassBody.properties?.forEach((node) => {
                    const content = this._parser.syntaxAnalyser.expandAllContent(node.value);
                    const calls = content.filter(node => node.type === "CallExpression");
                    calls.forEach(call => {
                        const params = call.arguments;
                        const methodName = call.callee?.property?.name;
                        const endPosition = call.callee?.property?.end;
                        if (methodName && endPosition) {
                            const strategy = new FieldsAndMethodForPositionBeforeCurrentStrategy_1.FieldsAndMethodForPositionBeforeCurrentStrategy(this._parser.syntaxAnalyser, this._parser);
                            const classNameOfTheMethodCallee = strategy.acornGetClassName(className, endPosition);
                            if (classNameOfTheMethodCallee) {
                                const fieldsAndMethods = strategy.destructureFieldsAndMethodsAccordingToMapParams(classNameOfTheMethodCallee);
                                if (fieldsAndMethods) {
                                    const method = fieldsAndMethods.methods.find(method => method.name === methodName);
                                    if (method && !method.ui5ignored) {
                                        const isException = this._configHandler.checkIfMemberIsException(fieldsAndMethods.className, method.name);
                                        if (!isException) {
                                            this._lintParamQuantity(method, params, call, errors, UIClass, methodName, document);
                                            params.forEach((param, i) => {
                                                this._lintParamType(method, i, param, UIClass, errors, document);
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    });
                });
            }
        }
        const end = new Date().getTime();
        WrongParametersLinter.timePerChar = (end - start) / document.getText().length;
        // console.timeEnd("WrongParameterLinter");
        return errors;
    }
    _lintParamQuantity(method, params, call, errors, UIClass, methodName, document) {
        const methodParams = method.params;
        const mandatoryMethodParams = methodParams.filter(param => !param.isOptional && param.type !== "boolean");
        if (params.length < mandatoryMethodParams.length || params.length > methodParams.length) {
            const range = RangeAdapter_1.RangeAdapter.acornLocationToRange(call.callee.property.loc);
            errors.push({
                acornNode: call,
                className: UIClass.className,
                code: "UI5Plugin",
                source: this.className,
                message: `Method "${methodName}" has ${methodParams.length} (${mandatoryMethodParams.length} mandatory) param(s), but you provided ${params.length}`,
                range: range,
                severity: this._configHandler.getSeverity(this.className),
                fsPath: document.fileName
            });
        }
    }
    _lintParamType(method, i, param, UIClass, errors, document) {
        const paramFromMethod = method.params[i];
        if (paramFromMethod &&
            paramFromMethod.type !== "any" &&
            paramFromMethod.type !== "void" &&
            paramFromMethod.type) {
            const classNameOfTheParam = this._parser.syntaxAnalyser.getClassNameFromSingleAcornNode(param, UIClass);
            if (classNameOfTheParam && classNameOfTheParam !== paramFromMethod.type) {
                const { expectedClass, actualClass } = this._swapClassNames(paramFromMethod.type, classNameOfTheParam);
                const paramFromMethodTypes = expectedClass.split("|");
                const classNamesOfTheParam = actualClass.split("|");
                let typeMismatch = !this._getIfClassNameIntersects(paramFromMethodTypes, classNamesOfTheParam);
                if (typeMismatch) {
                    typeMismatch = !paramFromMethodTypes.find(className => {
                        return !!classNamesOfTheParam.find(classNameOfTheParam => {
                            return !this._getIfClassesDiffers(className, classNameOfTheParam);
                        });
                    });
                }
                if (typeMismatch) {
                    const [className1, className2] = [
                        paramFromMethod.type.includes("__map__") ? "map" : paramFromMethod.type,
                        classNameOfTheParam.includes("__map__") ? "map" : classNameOfTheParam
                    ];
                    const range = RangeAdapter_1.RangeAdapter.acornLocationToRange(param.loc);
                    errors.push({
                        acornNode: param,
                        code: "UI5Plugin",
                        className: UIClass.className,
                        source: this.className,
                        message: `"${paramFromMethod.name}" param is of type "${className1}", but provided "${className2}"`,
                        range: range,
                        severity: this._configHandler.getSeverity(this.className),
                        fsPath: document.fileName
                    });
                }
            }
        }
    }
    _getIfClassNameIntersects(classNames1, classNames2) {
        return !!classNames1.find(className1 => {
            return !!classNames2.find(className2 => className1 === className2);
        });
    }
    _getIfClassesDiffers(expectedClass, actualClass) {
        let classesDiffers = true;
        ({ expectedClass, actualClass } = this._swapClassNames(expectedClass, actualClass));
        if (this._checkIfClassesAreEqual(expectedClass, actualClass, "map", "object")) {
            classesDiffers = false;
        }
        else if (expectedClass.toLowerCase() === "any" || actualClass.toLowerCase() === "any") {
            classesDiffers = false;
        }
        else if (expectedClass.toLowerCase() === actualClass.toLowerCase()) {
            classesDiffers = false;
        }
        else if (expectedClass.toLowerCase() === "object" &&
            this._parser.classFactory.isClassAChildOfClassB(actualClass, "sap.ui.base.Object")) {
            classesDiffers = false;
        }
        else if (actualClass.toLowerCase() === "object" &&
            this._parser.classFactory.isClassAChildOfClassB(expectedClass, "sap.ui.base.Object")) {
            classesDiffers = false;
        }
        else if (this._checkIfClassesAreEqual(expectedClass, actualClass, "string", "sap.ui.core.csssize")) {
            classesDiffers = false;
        }
        else if (this._parser.nodeDAO.findNode(expectedClass)?.getKind() === "enum" && actualClass === "string") {
            classesDiffers = false;
        }
        else if (this._parser.nodeDAO.findNode(expectedClass)?.getKind() === "typedef") {
            classesDiffers = this._getIfClassesDiffers("map", actualClass);
        }
        else {
            classesDiffers = !this._parser.classFactory.isClassAChildOfClassB(actualClass, expectedClass);
        }
        return classesDiffers;
    }
    _swapClassNames(expectedClass, actualClass) {
        expectedClass = this._swapClassName(expectedClass);
        actualClass = this._swapClassName(actualClass);
        if (expectedClass.startsWith("Promise<") && actualClass.startsWith("Promise<")) {
            expectedClass = this._parser.syntaxAnalyser.getResultOfPromise(expectedClass);
            actualClass = this._parser.syntaxAnalyser.getResultOfPromise(actualClass);
        }
        if (expectedClass.endsWith("[]") &&
            actualClass.endsWith("[]") &&
            expectedClass.indexOf("|") === -1 &&
            actualClass.indexOf("|") === -1) {
            expectedClass = expectedClass.substring(0, expectedClass.length - 2);
            actualClass = actualClass.substring(0, actualClass.length - 2);
        }
        return { expectedClass, actualClass };
    }
    _checkIfClassesAreEqual(class1, class2, substitute1, substitute2) {
        return ((class1.toLowerCase() === substitute1 && class2.toLowerCase() === substitute2) ||
            (class1.toLowerCase() === substitute2 && class2.toLowerCase() === substitute1));
    }
    _swapClassName(className) {
        const numbers = ["number", "float", "int", "integer"];
        if (className.toLowerCase() === "array") {
            className = "any[]";
        }
        if (className.includes("__map__") || className.includes("__mapparam__")) {
            if (className.endsWith("[]")) {
                className = "map[]";
            }
            else {
                className = "map";
            }
        }
        if (className === "void" || !className) {
            className = "any";
        }
        if (className === "Promise") {
            className = "Promise<any>";
        }
        if (numbers.includes(className.toLowerCase())) {
            className = "number";
        }
        return className;
    }
}
exports.WrongParametersLinter = WrongParametersLinter;
WrongParametersLinter.timePerChar = 0;
