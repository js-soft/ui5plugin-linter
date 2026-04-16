"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ui5plugin_parser_1 = require("ui5plugin-parser");
const PascalCase_1 = require("./transform/PascalCase");
class AMeaningAssumptionGenerator {
    constructor(pattern, document, parser, configHandler) {
        this._pattern = pattern;
        this._document = document;
        this._parser = parser;
        this._configHandler = configHandler;
    }
    _generateMeaningAssumption(tagAttributes) {
        const validForSearchAttributes = this._configHandler.getAttributesToCheck();
        const bindingAttribute = tagAttributes?.find(attribute => {
            const { attributeName } = this._parser.xmlParser.getAttributeNameAndValue(attribute);
            return validForSearchAttributes.includes(attributeName);
        });
        const { attributeValue: binding } = bindingAttribute
            ? this._parser.xmlParser.getAttributeNameAndValue(bindingAttribute)
            : { attributeValue: undefined };
        const meaningAssumption = binding && this._getMeaningAssumptionFrom(binding);
        return meaningAssumption;
    }
    _getMeaningAssumptionFrom(attributeValue) {
        let isBinding = attributeValue.startsWith("{") && attributeValue.endsWith("}");
        if (isBinding) {
            if (!(attributeValue.match(/\{/g)?.length === 1 && attributeValue.match(/\}/g)?.length === 1)) {
                try {
                    eval(`(${attributeValue})`);
                }
                catch (oError) {
                    isBinding = false;
                }
            }
        }
        // /MyPath
        // MyPath
        // MyModel>MyPath
        // MyModel>/MyPath
        // MyModel>/MY_PATH
        // MyModel>/MyPath/AnotherPath
        // MyModel>/MyPath/AnotherPath/results
        // i18n>text
        let path = attributeValue;
        if (isBinding) {
            try {
                const theObject = eval(`(${attributeValue})`);
                path = theObject?.path ?? "";
            }
            catch (error) {
                path = attributeValue.substring(1, attributeValue.length - 1);
            }
        }
        if (isBinding) {
            const pathWithoutModel = path.split(">").pop();
            const model = path.split(">").shift();
            if (model === "i18n" && pathWithoutModel) {
                const i18nText = this._getI18nTextById(pathWithoutModel);
                const i18nPascalCase = i18nText && new PascalCase_1.PascalCase().transform(i18nText);
                return i18nPascalCase;
            }
            else {
                const pathWithoutResults = pathWithoutModel?.replace(/\/results$/, "");
                const pathLastPart = pathWithoutResults?.split("/").pop();
                const lastPartWithoutUnderscoreParts = pathLastPart?.split("_");
                const lastPartPascalCase = lastPartWithoutUnderscoreParts
                    ?.map(part => {
                    const partLower = this._isUpperCase(part) ? part?.toLowerCase() : part;
                    const pascalCase = this._toFirstCharUpper(partLower);
                    return pascalCase;
                })
                    .join("")
                    .replace(/[^a-zA-Z| ]/g, "");
                return lastPartPascalCase;
            }
        }
        else if (!attributeValue.startsWith("{") && !attributeValue.endsWith("}")) {
            return new PascalCase_1.PascalCase().transform(path);
        }
    }
    _getI18nTextById(i18nId) {
        const className = this._parser.fileReader.getClassNameFromPath(this._document.fileName);
        const manifest = className && ui5plugin_parser_1.ParserPool.getManifestForClass(className);
        const componentName = manifest && manifest.componentName;
        const translations = componentName && this._parser.resourceModelData.resourceModels[componentName];
        if (translations) {
            return translations.find(translation => translation.id === i18nId)?.description;
        }
    }
    _isUpperCase(anyString) {
        return anyString?.split("").every(char => char.toUpperCase() === char);
    }
    _toFirstCharLower(anyString) {
        if (!anyString) {
            return "";
        }
        else if (anyString.length === 1) {
            return anyString[0].toLowerCase();
        }
        else {
            return anyString[0].toLowerCase() + anyString.substring(1, anyString.length);
        }
    }
    _toFirstCharUpper(anyString) {
        if (!anyString) {
            return "";
        }
        else if (anyString.length === 1) {
            return anyString[0].toUpperCase();
        }
        else {
            return anyString[0].toUpperCase() + anyString.substring(1, anyString.length);
        }
    }
}
exports.default = AMeaningAssumptionGenerator;
