import { ITag } from "ui5plugin-parser/dist/classes/parsing/util/xml/XMLParser";
import APatternValidator from "./APatternValidator";
export default class IdPatternValidator extends APatternValidator<ITag> {
    validateValue(actualId: string, tag: ITag): void;
    private _assembleExpectedValueRegExp;
}
