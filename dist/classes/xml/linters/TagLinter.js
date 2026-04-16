"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagLinter = void 0;
const __1 = require("../../..");
const Linter_1 = require("../../Linter");
const XMLLinter_1 = require("./abstraction/XMLLinter");
class TagLinter extends XMLLinter_1.XMLLinter {
    constructor() {
        super(...arguments);
        this.className = Linter_1.XMLLinters.TagLinter;
    }
    _getErrors(document) {
        const errors = [];
        const XMLFile = this._parser.textDocumentTransformer.toXMLFile(document);
        if (XMLFile) {
            const tags = this._parser.xmlParser.getAllTags(XMLFile);
            tags.forEach((tag, index) => {
                const previousTag = tags[index - 1];
                if (!previousTag || previousTag.text !== "<!-- @ui5ignore -->") {
                    errors.push(...this._getClassNameErrors(tag, XMLFile));
                }
            });
        }
        return errors;
    }
    _getClassNameErrors(tag, XMLFile) {
        const documentText = XMLFile.content;
        const errors = [];
        const tagClass = this._parser.xmlParser.getFullClassNameFromTag(tag, XMLFile);
        const documentClassName = this._parser.fileReader.getClassNameFromPath(XMLFile.fsPath) || "";
        if (tagClass.startsWith("http://www.w3.org/1999/xhtml.")) {
            return errors;
        }
        if (!tagClass) {
            const range = __1.RangeAdapter.offsetsRange(documentText, tag.positionBegin, tag.positionEnd + 1);
            if (range && this._parser.xmlParser.getIfPositionIsNotInComments(XMLFile, tag.positionBegin)) {
                const prefix = this._parser.xmlParser.getTagPrefix(tag.text);
                errors.push({
                    code: "UI5plugin",
                    message: `"${prefix}" prefix is not defined`,
                    source: this.className,
                    severity: this._configHandler.getSeverity(this.className),
                    range: range,
                    className: documentClassName,
                    fsPath: XMLFile.fsPath
                });
            }
        }
        else {
            const tagParts = tagClass.split(".");
            const tagName = tagParts.pop();
            const tagPrefixLibrary = tagParts.join(".");
            const isAggregation = tagName && tagName[0] ? tagName[0].toLowerCase() === tagName[0] : false;
            if (!isAggregation) {
                this._lintClass(tagClass, documentText, tag, XMLFile, errors, documentClassName);
            }
            else {
                this._lintAggregation(tag, XMLFile, tagName, tagPrefixLibrary, documentText, errors, documentClassName);
            }
        }
        return errors;
    }
    _lintAggregation(tag, XMLFile, tagName, tagPrefixLibrary, documentText, errors, documentClassName) {
        let position = tag.positionBegin;
        if (tag.text.startsWith("</")) {
            position = tag.positionEnd;
        }
        const parentTag = this._parser.xmlParser.getParentTagAtPosition(XMLFile, position - 1);
        if (parentTag.text && tagName) {
            const parentTagPrefix = this._parser.xmlParser.getTagPrefix(parentTag.text);
            const tagClass = this._parser.xmlParser.getFullClassNameFromTag(parentTag, XMLFile);
            if (tagClass) {
                let errorText;
                const parentTagPrefixLibrary = this._parser.xmlParser.getLibraryPathFromTagPrefix(XMLFile, parentTagPrefix, parentTag.positionBegin);
                const aggregation = this._findAggregation(tagClass, tagName);
                if (!aggregation) {
                    errorText = `"${tagName}" aggregation doesn't exist in "${tagClass}"`;
                }
                else if (parentTagPrefixLibrary !== tagPrefixLibrary) {
                    errorText = `Library "${parentTagPrefixLibrary}" of class "${tagClass}" doesn't match with aggregation tag library "${tagPrefixLibrary}"`;
                }
                if (errorText) {
                    const range = __1.RangeAdapter.offsetsRange(documentText, tag.positionBegin, tag.positionEnd + 1);
                    if (range && this._parser.xmlParser.getIfPositionIsNotInComments(XMLFile, tag.positionBegin)) {
                        errors.push({
                            code: "UI5plugin",
                            message: errorText,
                            source: this.className,
                            range: range,
                            severity: this._configHandler.getSeverity(this.className),
                            className: documentClassName,
                            fsPath: XMLFile.fsPath
                        });
                    }
                }
            }
        }
    }
    _lintClass(tagClass, documentText, tag, XMLFile, errors, documentClassName) {
        const UIClass = this._parser.classFactory.getUIClass(tagClass);
        if (!UIClass.classExists && !this._isClassException(tagClass)) {
            this._lintIfClassExists(documentText, tag, XMLFile, errors, tagClass, documentClassName);
        }
        else if (UIClass.classExists && UIClass.deprecated && !this._isClassException(tagClass)) {
            this._lintIfClassIsDeprecated(documentText, tag, XMLFile, errors, tagClass, documentClassName);
        }
    }
    _lintIfClassIsDeprecated(documentText, tag, XMLFile, errors, tagClass, documentClassName) {
        const range = __1.RangeAdapter.offsetsRange(documentText, tag.positionBegin, tag.positionEnd + 1);
        if (range && this._parser.xmlParser.getIfPositionIsNotInComments(XMLFile, tag.positionBegin)) {
            errors.push({
                code: "UI5plugin",
                message: `"${tagClass}" class is deprecated`,
                source: this.className,
                severity: this._configHandler.getSeverity(this.className),
                range: range,
                className: documentClassName,
                fsPath: XMLFile.fsPath,
                tags: [Linter_1.DiagnosticTag.Deprecated]
            });
        }
    }
    _lintIfClassExists(documentText, tag, XMLFile, errors, tagClass, documentClassName) {
        const range = __1.RangeAdapter.offsetsRange(documentText, tag.positionBegin, tag.positionEnd + 1);
        if (range && this._parser.xmlParser.getIfPositionIsNotInComments(XMLFile, tag.positionBegin)) {
            errors.push({
                code: "UI5plugin",
                message: `"${tagClass}" class doesn't exist`,
                source: this.className,
                severity: this._configHandler.getSeverity(this.className),
                range: range,
                className: documentClassName,
                fsPath: XMLFile.fsPath
            });
        }
    }
    _findAggregation(className, aggregationName) {
        const UIClass = this._parser.classFactory.getUIClass(className);
        let aggregation = UIClass.aggregations.find(aggregation => aggregation.name === aggregationName);
        if (!aggregation && UIClass.parentClassNameDotNotation) {
            aggregation = this._findAggregation(UIClass.parentClassNameDotNotation, aggregationName);
        }
        return aggregation;
    }
    _isClassException(className) {
        const exceptions = ["sap.ui.core.FragmentDefinition"];
        return exceptions.includes(className);
    }
}
exports.TagLinter = TagLinter;
