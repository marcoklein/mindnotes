import { Lexem } from "./Lexem";
import { LEXEM_EMPTY_LINE, LEXEM_INDENT, LEXEM_NODE_TEXT, LEXEM_MULTILINE_INDICATOR } from "./LexemType";

export const REGEX_LINE = /^(\s*)(.*)/;
export const REGEX_NODE = /(\+?)(\s*)(.*)/;

export interface LexerLineResult {
    lexems: Lexem[];
    errors: SyntaxError[];
}

/**
 * The Lexer extracts tokens, called lexemes of each line.
 */
export class MindNotesLexer {


    public tokenizeLine(inputLine: string): LexerLineResult {
        let curStart = 0;
        const result = {
            lexems: [],
            errors: []
        } as LexerLineResult;

        // process empty line
        if (/^(\s*)$/.test(inputLine)) {
            result.lexems.push({
                type: LEXEM_EMPTY_LINE,
                start: curStart,
                end: inputLine.length,
                content: inputLine
            });
            return result;
        }

        // process line
        const lineSplit = inputLine.split(REGEX_LINE);
        const indentation = lineSplit[1];
        if (indentation.length) {
            // we have indentation
            result.lexems.push({
                type: LEXEM_INDENT,
                start: curStart,
                end: curStart + indentation.length,
                content: indentation
            });
            curStart = indentation.length;
        }

        // lineBody can be node, comment, or propertyListExpression
        const lineBody = lineSplit[2];

        // evaluate tag if given
        if (lineBody.charAt(0) === '(') {
            // evaluate props list
        } else if (lineBody.charAt(0) === '#') {
            // evaluate comment
        } else {
            const nodeBodySplit = lineBody.split(REGEX_NODE);

            // test for multiline tag
            const multilineIndicator = nodeBodySplit[1];
            if (multilineIndicator.length) {
                // multiline tag is present
                result.lexems.push({
                    type: LEXEM_MULTILINE_INDICATOR,
                    start: curStart,
                    end: curStart + multilineIndicator.length,
                    content: multilineIndicator
                });
                curStart += multilineIndicator.length;
            }

            // possible whitespace between tag and text
            curStart += nodeBodySplit[2].length;

            // rest is node text
            const nodeText = nodeBodySplit[3];
            if (nodeText.length) {
                result.lexems.push({
                    type: LEXEM_NODE_TEXT,
                    start: curStart,
                    end: curStart + nodeText.length,
                    content: nodeText
                });
                curStart += nodeText.length;
            }
        }

        return result;
    }

}