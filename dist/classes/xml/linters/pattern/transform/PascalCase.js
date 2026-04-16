"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PascalCase = void 0;
class PascalCase {
    transform(text) {
        let pascalCaseString = "";
        const stringWithLiteralCharactersOnly = text.replace(/[^a-zA-Z| ]/g, "");
        pascalCaseString = stringWithLiteralCharactersOnly
            .split(" ")
            .map(stringPart => {
            let returnString = "";
            if (stringPart && stringPart[0]) {
                const firstCharUpper = stringPart[0].toUpperCase();
                returnString = `${firstCharUpper}${stringPart.substring(1, stringPart.length)}`;
            }
            return returnString;
        })
            .join("");
        return pascalCaseString;
    }
}
exports.PascalCase = PascalCase;
