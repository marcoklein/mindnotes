import { Lexem } from './Lexem';
import {
  LEXEM_EMPTY_LINE,
  LEXEM_INDENT,
  LEXEM_NODE_TEXT,
  LEXEM_MULTILINE_INDICATOR,
  LEXEM_ATTRIBUTE_LIST_START,
  LEXEM_ATTRIBUTE_LIST_END,
  LEXEM_ATTRIBUTE_ASSIGN,
  LEXEM_ATTRIBUTE_VALUE,
  LEXEM_ATTRIBUTE_NAME,
} from './LexemType';
import { parserLogger } from '../logger.parser';
const log = parserLogger('lexer');

export const REGEX_LINE = /^(\s*)(.*)/;
export const REGEX_NODE = /(\+?)(\s*)(.*)/;
export const REGEX_PROPERTY_LIST = /(\()(\s*)([\w_]+)(\s*)(\=)(\s*)([\w_]+)(\s*)(,((\s*)([\w_]+)(\s*)(\=)(\s*)([\w_]+)(\s*)))*(\))/g;
export const REGEX_PROPERTY_ITEM = /([\w_]+)(\s*)(\=)(\s*)([\w_]+)/g;

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
      errors: [],
    } as LexerLineResult;

    // process empty line
    if (/^(\s*)$/.test(inputLine)) {
      result.lexems.push({
        type: LEXEM_EMPTY_LINE,
        start: curStart,
        end: inputLine.length,
        content: inputLine,
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
        content: indentation,
      });
      curStart = indentation.length;
    }

    // lineBody can be node, comment, or propertyListExpression
    const lineBody = lineSplit[2];

    // evaluate tag if given
    if (lineBody.charAt(0) === '(') {
      // evaluate props list
      log.debug('Tokenizing property list');
      if (!lineBody.trim().endsWith(')')) {
        // TODO add syntax error
        log.warn('Property list has to end with ) or there is a different syntax error');
      } else {
        result.lexems.push({
          type: LEXEM_ATTRIBUTE_LIST_START,
          start: curStart,
          end: curStart + 1,
          content: '(',
        });
        curStart += 1;

        let entryResult: RegExpExecArray | null;
        const propertyItemRegex = new RegExp(REGEX_PROPERTY_ITEM, 'g');
        let lastIndex = 1;
        while ((entryResult = propertyItemRegex.exec(lineBody))) {
          // move start position before found item
          curStart += propertyItemRegex.lastIndex - entryResult[0].length - lastIndex;
          lastIndex = propertyItemRegex.lastIndex;

          const propName = entryResult[1];
          const nameSpace = entryResult[2];
          const propAssign = entryResult[3];
          const valueSpace = entryResult[4];
          const propValue = entryResult[5];

          result.lexems.push({
            type: LEXEM_ATTRIBUTE_NAME,
            start: curStart,
            end: curStart + propName.length,
            content: propName,
          });
          curStart += propName.length + nameSpace.length;

          result.lexems.push({
            type: LEXEM_ATTRIBUTE_ASSIGN,
            start: curStart,
            end: curStart + propAssign.length,
            content: propAssign,
          });
          curStart += propAssign.length + valueSpace.length;

          result.lexems.push({
            type: LEXEM_ATTRIBUTE_VALUE,
            start: curStart,
            end: curStart + propValue.length,
            content: propValue,
          });
          curStart += propValue.length;
        }

        result.lexems.push({
          type: LEXEM_ATTRIBUTE_LIST_END,
          start: curStart,
          end: curStart + 1,
          content: ')',
        });
        curStart += 1;

        // const propertyListSplit = lineBody.split(',');
        // const propEntries = propertyListSplit.map(entry => entry.trim()).filter(entry => !!entry.match(REGEX_PROPERTY_ITEM));
        // log.info(propEntries);

        // .map(entry => entry.split('=')).map(entry => entry.map(e => e.trim()));
      }
    } else if (lineBody.charAt(0) === '#') {
      // evaluate comment
      log.info('Skipping commented line');
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
          content: multilineIndicator,
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
          content: nodeText,
        });
        curStart += nodeText.length;
      }
    }

    return result;
  }
}
