"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventTypeLinter = void 0;
const CustomTSClass_1 = require("ui5plugin-parser/dist/classes/parsing/ui5class/ts/CustomTSClass");
const RangeAdapter_1 = require("ui5plugin-parser/dist/classes/parsing/util/range/adapters/RangeAdapter");
const Linter_1 = require("../../Linter");
const JSLinter_1 = require("./abstraction/JSLinter");
class EventTypeLinter extends JSLinter_1.JSLinter {
    constructor() {
        super(...arguments);
        this.className = Linter_1.JSLinters.EventTypeLinter;
    }
    _getErrors(document) {
        const errors = [];
        const UIClass = this._parser.textDocumentTransformer.toCustomUIClass(document);
        if (!(UIClass instanceof CustomTSClass_1.CustomTSClass)) {
            return errors;
        }
        const eventHandlers = UIClass.methods
            .filter(method => method.isEventHandler)
            .filter(method => method?.node?.getParameters().length);
        const viewsAndFragments = this._parser.classFactory.getViewsAndFragmentsOfControlHierarchically(UIClass, [], true, true, true);
        const XMLFiles = [...viewsAndFragments.views, ...viewsAndFragments.fragments];
        XMLFiles.forEach(XMLFile => {
            const documentErrors = this._getEventTypeErrorsFromXMLDocument(XMLFile, eventHandlers, UIClass);
            errors.push(...documentErrors);
        });
        return errors;
    }
    _getEventTypeErrorsFromXMLDocument(XMLFile, eventHandlers, UIClass) {
        return eventHandlers.reduce((errors, eventHandler) => {
            const eventHandlerXMLData = this._getEventHandlerData(XMLFile, eventHandler.name);
            if (!eventHandlerXMLData) {
                return errors;
            }
            const expectedEventType = this._generateEvent(eventHandlerXMLData.eventName, eventHandlerXMLData.eventOwner);
            const actualEventType = eventHandler.node?.getParameters().at(0)?.getTypeNode()?.getText();
            const eventTypeNode = eventHandler.node?.getParameters().at(0)?.getTypeNode();
            const typeRange = eventTypeNode &&
                RangeAdapter_1.RangeAdapter.offsetsRange(UIClass.classText, eventTypeNode.getStart(), eventTypeNode.getEnd());
            if (!actualEventType || expectedEventType === actualEventType || !eventTypeNode || !typeRange) {
                return errors;
            }
            errors.push({
                acornNode: UIClass.node,
                code: "UI5Plugin",
                className: UIClass.className,
                source: this.className,
                message: `Invalid event parameter type. Expected "${expectedEventType}", but got "${actualEventType}"`,
                range: typeRange,
                severity: this._configHandler.getSeverity(this.className),
                fsPath: UIClass.fsPath
            });
            return errors;
        }, []);
    }
    _generateEvent(eventName, owner) {
        const ownerName = owner.split(".").pop() ?? "";
        const eventNameUpper = eventName[0].toUpperCase() + eventName.substring(1, eventName.length);
        const tsEventParameters = `${ownerName}$${eventNameUpper}Event`;
        return tsEventParameters;
    }
    _getEventHandlerData(XMLFile, eventHandlerName) {
        const regex = new RegExp(`".?${eventHandlerName}"`);
        const eventHandlerPosition = regex.exec(XMLFile.content)?.index;
        if (!eventHandlerPosition) {
            return;
        }
        const tag = this._parser.xmlParser.getTagInPosition(XMLFile, eventHandlerPosition);
        const attributes = this._parser.xmlParser.getAttributesOfTheTag(tag);
        const eventHandlerAttribute = attributes?.find(attribute => {
            const { attributeValue } = this._parser.xmlParser.getAttributeNameAndValue(attribute);
            return this._parser.xmlParser.getEventHandlerNameFromAttributeValue(attributeValue) === eventHandlerName;
        });
        const attributeData = eventHandlerAttribute && this._parser.xmlParser.getAttributeNameAndValue(eventHandlerAttribute);
        const tagText = tag.text;
        const tagPrefix = this._parser.xmlParser.getTagPrefix(tagText);
        const classNameOfTheTag = this._parser.xmlParser.getClassNameFromTag(tagText);
        const libraryPath = this._parser.xmlParser.getLibraryPathFromTagPrefix(XMLFile, tagPrefix, eventHandlerPosition);
        const classOfTheTag = [libraryPath, classNameOfTheTag].join(".");
        const eventOwner = attributeData && this._getEventData(classOfTheTag, attributeData.attributeName)?.owner;
        if (!attributeData || !eventOwner) {
            return;
        }
        const eventHandlerData = {
            className: classOfTheTag,
            eventName: attributeData.attributeName,
            eventHandlerName,
            eventOwner
        };
        return eventHandlerData;
    }
    _getEventData(className, eventName) {
        const UIClasses = this._getClassAndParents(className);
        const eventDataSet = UIClasses.flatMap(UIClass => UIClass.events.map(UIEvent => ({ event: UIEvent, owner: UIClass.className })));
        const eventData = eventDataSet.find(event => event.event.name === eventName);
        return eventData;
    }
    _getClassAndParents(className) {
        const UIClasses = [];
        const UIClass = this._parser.classFactory.getUIClass(className);
        if (UIClass) {
            UIClasses.push(UIClass);
        }
        if (UIClass?.parentClassNameDotNotation) {
            const parents = this._getClassAndParents(UIClass.parentClassNameDotNotation);
            UIClasses.push(...parents);
        }
        return UIClasses;
    }
}
exports.EventTypeLinter = EventTypeLinter;
