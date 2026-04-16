"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagAttributeLinter = void 0;
const ui5plugin_parser_1 = require("ui5plugin-parser");
const __1 = require("../../..");
const Linter_1 = require("../../Linter");
const XMLLinter_1 = require("./abstraction/XMLLinter");
const EventPatternValidator_1 = require("./pattern/EventPatternValidator");
const IdPatternValidator_1 = require("./pattern/IdPatternValidator");
function isNumeric(value) {
    return /^-{0,1}\d+$/.test(value);
}
class TagAttributeLinter extends XMLLinter_1.XMLLinter {
    constructor() {
        super(...arguments);
        this.className = Linter_1.XMLLinters.TagAttributeLinter;
    }
    _getErrors(document) {
        let errors = [];
        const XMLFile = this._parser.textDocumentTransformer.toXMLFile(document);
        if (!XMLFile) {
            return errors;
        }
        const tags = this._parser.xmlParser.getAllTags(XMLFile);
        errors = tags.reduce((tagErrors, tag, index) => {
            const previousTag = tags[index - 1];
            const tagAttributes = this._parser.xmlParser.getAttributesOfTheTag(tag);
            if (!tagAttributes || (previousTag && this._isTagIgnored(previousTag))) {
                return tagErrors;
            }
            const tagPrefix = this._parser.xmlParser.getTagPrefix(tag.text);
            const className = this._parser.xmlParser.getClassNameFromTag(tag.text);
            const libraryPath = className && this._parser.xmlParser.getLibraryPathFromTagPrefix(XMLFile, tagPrefix, tag.positionEnd);
            if (!className || !libraryPath) {
                return tagErrors;
            }
            const classOfTheTag = [libraryPath, className].join(".");
            const attributeErrors = tagAttributes.reduce((errors, tagAttribute) => this._getTagAttributeErrors(errors, tagAttribute, {
                XMLFile,
                tags,
                tagAttributes,
                tag,
                document,
                classOfTheTag,
                previousTag
            }), []);
            tagErrors.push(...attributeErrors);
            return tagErrors;
        }, []);
        return errors;
    }
    _isTagIgnored(previousTag) {
        return /<!-- ?@ui5ignore ?-->/.test(previousTag.text);
    }
    _getTagAttributeErrors(errors, tagAttribute, { classOfTheTag, tagAttributes, document, tags, tag, XMLFile, previousTag }) {
        //check tag attributes
        const attributeValidation = this._validateTagAttribute(classOfTheTag, tagAttribute, tagAttributes, document, tags, tag, previousTag);
        if (attributeValidation.valid) {
            return errors;
        }
        const indexOfTagBegining = tag.text.indexOf(tagAttribute);
        const positionBegin = tag.positionBegin + indexOfTagBegining;
        const positionEnd = positionBegin + tagAttribute.length;
        const range = __1.RangeAdapter.offsetsRange(document.getText(), positionBegin, positionEnd);
        if (!range || !this._parser.xmlParser.getIfPositionIsNotInComments(XMLFile, tag.positionBegin)) {
            return errors;
        }
        errors.push({
            code: "UI5plugin",
            message: attributeValidation.message || "Invalid attribute",
            source: this.className,
            severity: attributeValidation.severity,
            attribute: tagAttribute,
            range: range,
            className: XMLFile.name || "",
            fsPath: XMLFile.fsPath
        });
        return errors;
    }
    _validateTagAttribute(className, attribute, attributes, document, tags, tag, previousTag) {
        let attributeValidation = {
            valid: false,
            severity: this._configHandler.getSeverity(this.className)
        };
        const UIClass = this._parser.classFactory.getUIClass(className);
        const { attributeName, attributeValue } = this._parser.xmlParser.getAttributeNameAndValue(attribute);
        const isExclusion = attributeName.startsWith("xmlns") || this._isAttributeNameAlwaysValid(className, attributeName);
        const isAttributeNameDuplicated = this._getIfAttributeNameIsDuplicated(attribute, attributes);
        const attributeNameValid = !isAttributeNameDuplicated &&
            (isExclusion || this._validateAttributeName(className, attribute, previousTag));
        const attributeValueValidData = this._validateAttributeValue(className, attribute, document, tags, tag, previousTag);
        attributeValidation.valid = attributeNameValid && attributeValueValidData.isValueValid;
        if (!attributeNameValid && UIClass.parentClassNameDotNotation) {
            attributeValidation = this._validateTagAttribute(UIClass.parentClassNameDotNotation, attribute, attributes, document, tags, tag, previousTag);
        }
        else if (!attributeValidation.valid) {
            let message = "";
            if (isAttributeNameDuplicated) {
                message = `Duplicated attribute ${attributeName}`;
            }
            else if (!attributeNameValid) {
                message = `Invalid attribute name (${attributeName})`;
            }
            else if (!attributeValueValidData.isValueValid) {
                message = attributeValueValidData.message || `Invalid attribute value (${attributeValue})`;
                attributeValidation.severity = attributeValueValidData.severity;
            }
            attributeValidation.message = message;
        }
        return attributeValidation;
    }
    _isAttributeIgnored(previousTag, attributeName) {
        return !!previousTag?.text
            .match(/(?<=<!-- ?@ui5ignore ?)(([a-zA-Z]|\d|,| )*?)(?= ?-->)/)?.[0]
            .split(",")
            .some(part => part.trim() === attributeName);
    }
    _isAttributePatternIgnored(previousTag, attributeName) {
        return (!!previousTag?.text
            .match(/(?<=<!-- ?@ui5ignore-patterns ?)(([a-zA-Z]|\d|,| )*?)(?= ?-->)/)?.[0]
            .split(",")
            .some(part => part.trim() === attributeName) ||
            !!(previousTag && /<!-- ?@ui5ignore-patterns ?-->/.test(previousTag.text)));
    }
    _getIfAttributeNameIsDuplicated(attribute, attributes) {
        const attributeNames = attributes.map(attribute => this._parser.xmlParser.getAttributeNameAndValue(attribute).attributeName);
        const nameOfTheCurrentAttribute = this._parser.xmlParser.getAttributeNameAndValue(attribute).attributeName;
        const isDuplicated = attributeNames.filter(attributeName => attributeName === nameOfTheCurrentAttribute).length > 1;
        return isDuplicated;
    }
    _validateAttributeValue(className, attribute, document, tags, tag, previousTag) {
        let isValueValid = true;
        let message;
        let severity = this._configHandler.getSeverity(this.className);
        const shouldIdStyleBeChecked = !!this._configHandler.getIdNamingPattern();
        const { attributeName, attributeValue } = this._parser.xmlParser.getAttributeNameAndValue(attribute);
        if (this._isAttributeIgnored(previousTag, attributeName)) {
            const isValueValid = true;
            const severity = Linter_1.Severity.Information;
            const message = "";
            return { isValueValid, severity, message };
        }
        const UIClass = this._parser.classFactory.getUIClass(className);
        const property = UIClass.properties.find(property => property.name === attributeName);
        const event = UIClass.events.find(event => event.name === attributeName);
        let responsibleControlName;
        if (event) {
            responsibleControlName = this._parser.fileReader.getResponsibleClassForXMLDocument(document);
        }
        const isAttributeBinded = attributeValue.startsWith("{") && attributeValue.endsWith("}");
        if (attributeValue.startsWith("cmd:")) {
            isValueValid = this._checkIfCommandIsMentionedInManifest(attributeValue, document);
            if (!isValueValid) {
                message = `Command "${attributeValue}" is not found in manifest`;
            }
        }
        else if (attributeName === "id" &&
            shouldIdStyleBeChecked &&
            !this._isAttributePatternIgnored(previousTag, attributeName)) {
            const id = attributeValue;
            const pattern = this._configHandler.getIdNamingPattern();
            const patternValidator = new IdPatternValidator_1.default(pattern, document, this._parser, this._configHandler);
            try {
                patternValidator.validateValue(id, tag);
                isValueValid = true;
            }
            catch (error) {
                isValueValid = false;
                if (error instanceof Error) {
                    message = error.message;
                }
            }
        }
        else if (isAttributeBinded || property?.type === "string") {
            isValueValid = true;
        }
        else if (property?.type === "sap.ui.core.URI") {
            isValueValid = true;
        }
        else if (property && property.typeValues.length > 0) {
            isValueValid = !!property.typeValues.find(typeValue => typeValue.text === attributeValue);
        }
        else if (property?.type === "boolean") {
            isValueValid = ["true", "false"].indexOf(attributeValue) > -1;
        }
        else if (property?.type === "int") {
            isValueValid = isNumeric(attributeValue);
        }
        else if (event && responsibleControlName) {
            const eventHandlerName = this._parser.xmlParser.getEventHandlerNameFromAttributeValue(attributeValue);
            const eventHandlerNoDot = eventHandlerName.startsWith(".") ? eventHandlerName.replace(".", "") : eventHandlerName;
            const pattern = this._configHandler.getEventNamingPattern();
            const patternValidator = pattern && new EventPatternValidator_1.default(pattern, document, this._parser, this._configHandler);
            try {
                if (patternValidator && !this._isAttributePatternIgnored(previousTag, attributeName)) {
                    patternValidator.validateValue(eventHandlerName, [event, tag]);
                }
                isValueValid = !!this._parser.xmlParser
                    .getMethodsOfTheControl(responsibleControlName)
                    .find(method => method.name === eventHandlerNoDot);
                if (!isValueValid) {
                    const manifest = ui5plugin_parser_1.ParserPool.getManifestForClass(eventHandlerName);
                    if (manifest) {
                        const parts = eventHandlerName.split(".");
                        const formattedEventName = parts.pop();
                        const className = parts.join(".");
                        isValueValid = !!this._parser.xmlParser
                            .getMethodsOfTheControl(className)
                            .find(method => method.name === formattedEventName);
                    }
                    else if (eventHandlerNoDot.split(".").length === 2) {
                        ({ isValueValid, message } = this._validateAttributeValueInCaseOfMethodCallFromMember(eventHandlerNoDot, responsibleControlName));
                        if (!isValueValid) {
                            ({ isValueValid, message } = this._validateAttributeValueInCaseOfInTagRequire(eventHandlerName, tags, isValueValid, message));
                        }
                    }
                }
                message = message || `Event handler "${eventHandlerName}" not found in "${responsibleControlName}".`;
            }
            catch (error) {
                isValueValid = false;
                if (error instanceof Error) {
                    message = error.message;
                }
            }
        }
        if (isValueValid &&
            property?.defaultValue &&
            attributeValue === property.defaultValue &&
            this._configHandler.getLinterUsage(Linter_1.XMLLinters.TagAttributeDefaultValueLinter)) {
            isValueValid = false;
            severity = this._configHandler.getSeverity(Linter_1.XMLLinters.TagAttributeDefaultValueLinter);
            message = `Value "${attributeValue}" is unnecessary, it is the sames as default value of "${property.name}" property`;
        }
        return { isValueValid, message, severity };
    }
    _validateAttributeValueInCaseOfMethodCallFromMember(eventName, responsibleControlName) {
        const eventNameParts = eventName.split(".");
        const fieldName = eventNameParts.shift();
        const methodName = eventNameParts.shift();
        let isValueValid = false;
        let message = "";
        if (fieldName && methodName) {
            const field = this._parser.classFactory
                .getClassFields(responsibleControlName)
                .find(field => field.name === fieldName);
            isValueValid =
                !!field?.type &&
                    !!this._parser.classFactory.getClassMethods(field.type).find(method => method.name === methodName);
            if (!isValueValid) {
                message = `Method "${methodName}" not found in "${fieldName}"`;
            }
        }
        return { isValueValid, message };
    }
    _checkIfCommandIsMentionedInManifest(attributeValue, document) {
        let isCommandMentionedInManifest = false;
        const documentClassName = this._parser.fileReader.getClassNameFromPath(document.fileName);
        const manifest = documentClassName && ui5plugin_parser_1.ParserPool.getManifestForClass(documentClassName);
        if (manifest) {
            const commandName = attributeValue.replace("cmd:", "");
            isCommandMentionedInManifest = !!manifest.content["sap.ui5"]?.commands?.[commandName];
        }
        else {
            //Let's skip linting if manifest wasn't found
            isCommandMentionedInManifest = true;
        }
        return isCommandMentionedInManifest;
    }
    _validateAttributeValueInCaseOfInTagRequire(eventName, tags, isValueValid, message) {
        const eventNameParts = eventName.split(".");
        const className = eventNameParts.shift();
        const methodName = eventNameParts.shift();
        if (className && methodName) {
            const attributesWithRequire = this._parser.xmlParser.getAllAttributesWithRequire(tags);
            const classPath = this._parser.xmlParser.getClassPathFromRequire(attributesWithRequire, className);
            if (classPath) {
                const className = classPath.replace(/\//g, ".");
                isValueValid = !!this._parser.xmlParser
                    .getMethodsOfTheControl(className)
                    .find(method => method.name === methodName);
                message = `Method "${methodName}" not found in "${className}"`;
            }
        }
        return { isValueValid, message };
    }
    _validateAttributeName(className, attribute, previousTag) {
        const indexOfEqualSign = attribute.indexOf("=");
        const attributeName = attribute.substring(0, indexOfEqualSign).trim();
        if (this._isAttributeIgnored(previousTag, attributeName)) {
            const isNameValid = true;
            const severity = Linter_1.Severity.Information;
            const message = "";
            return { isValueValid: isNameValid, severity, message };
        }
        const UIClass = this._parser.classFactory.getUIClass(className);
        const property = UIClass.properties.find(property => property.name === attributeName);
        const event = UIClass.events.find(event => event.name === attributeName);
        const aggregation = UIClass.aggregations.find(aggregation => aggregation.name === attributeName);
        const association = UIClass.associations.find(association => association.name === attributeName);
        const isXHTML = className.startsWith("http://www.w3.org/1999/xhtml.");
        const somethingInClassWasFound = !!(property || event || aggregation || association || isXHTML);
        return somethingInClassWasFound;
    }
    _isAttributeNameAlwaysValid(className, attribute) {
        const exclusions = {
            "*": ["id", "class", "binding"],
            "sap.ui.core.mvc.View": ["controllerName"],
            "sap.ui.core.mvc.XMLView": ["async"],
            "sap.ui.core.Fragment": ["fragmentName"],
            "sap.ui.core.ExtensionPoint": ["name"]
        };
        const isClassExclusion = exclusions[className] && exclusions[className].indexOf(attribute) > -1;
        const isAlwaysExclusion = exclusions["*"].indexOf(attribute) > -1;
        const perhapsItIsCustomData = attribute.indexOf(":") > -1;
        return isClassExclusion || isAlwaysExclusion || perhapsItIsCustomData;
    }
}
exports.TagAttributeLinter = TagAttributeLinter;
