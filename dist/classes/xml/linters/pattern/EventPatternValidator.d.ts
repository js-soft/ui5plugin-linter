import { IUIEvent } from "ui5plugin-parser/dist/classes/parsing/ui5class/AbstractBaseClass";
import { ITag } from "ui5plugin-parser/dist/classes/parsing/util/xml/XMLParser";
import APatternValidator from "./APatternValidator";
export default class EventPatternValidator extends APatternValidator<[IUIEvent, ITag]> {
    validateValue(eventHandler: string, data: [IUIEvent, ITag]): void;
    private _assembleExpectedValueRegExp;
}
