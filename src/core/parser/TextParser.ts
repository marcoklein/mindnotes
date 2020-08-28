import { MindNotesLexer } from './lexer/MindNotesLexer';
import { ParserTree, ParserNode } from './ParserTree';
import { Lexem } from './lexer/Lexem';
import { LEXEM_INDENT, LEXEM_NODE_TEXT, LEXEM_EMPTY_LINE, LEXEM_ATTRIBUTE_LIST_START, LEXEM_ATTRIBUTE_NAME } from './lexer/LexemType';
import { ParserTreeBuilder } from './ParserTreeBuilder';
import { parserLogger } from './logger.parser';

const log = parserLogger('text');

/**
 * Creates a Mindnotes Parser Tree.
 */
export class TextParser {
  private lexer: MindNotesLexer = new MindNotesLexer();

  public parse(text: string): ParserTree {
    // separate lines
    const lines = text.split(/\r?\n/);
    const builder = new ParserTreeBuilder();

    // parse line by line
    lines.forEach((line, index) => {
      this.parseLine(builder, index, line);
    });

    return builder.build();
  }

  /**
   * Utility to parse line after line.
   *
   * @param line
   */
  private parseLine(builder: ParserTreeBuilder, index: number, line: string) {
    // extract tokens for line
    const lexerResult = this.lexer.tokenizeLine(line);
    const tokens = lexerResult.lexems;
    log.debug('Got tokens for line: %j', tokens);

    if (!tokens.length) {
      this.pushError(index, line, 'UnprocessableLine', 'No tokens identified for line!');
      return;
    }

    // process tokens
    let token: Lexem | undefined;
    token = tokens.shift(); // first token

    // extract indent
    let indent = 0;
    if (token && token.type === LEXEM_INDENT) {
      indent = token.content.length;
      token = tokens.shift();
    }
    log.debug('indentation=%i', indent);

    // extract previous state
    const activeNode = builder.getTopNode();
    log.debug('active indentation=%i', activeNode.indentation);

    if (token && token.type === LEXEM_EMPTY_LINE) {
      // empty line actives multiline flag of active node
      activeNode.attributes = activeNode.attributes || {};
      activeNode.attributes.multiline = true;
    } else if (token) {
      // check indent
      if (indent === activeNode.indentation) {
        // same indentation
        // add to same level
        // TODO multiline for activeNode enabled?
        if (token.type === LEXEM_NODE_TEXT) {
          // new node
          // replace on node stack
          builder.pushSibling(indent, token.content);
        } else if (token.type === LEXEM_ATTRIBUTE_LIST_START) {
          token = this.parseAttributes(activeNode, tokens);
        }
      } else {
        if (indent < activeNode.indentation) {
          // dedent ... new node
          // add new node
          if (token.type === LEXEM_NODE_TEXT) {
            const sibling = builder.popToIndent(indent);
            if (!sibling) {
              this.pushError(index, line, 'WrongIndentation', 'Check your indentation');
              return;
            }
            // add sibling to that node
            builder.pushSibling(indent, token.content);
          }
        } else if (indent > activeNode.indentation) {
          // indent
          if (token.type === LEXEM_NODE_TEXT) {
            // new node
            builder.pushChild(indent, token.content);
          }
          token = this.parseAttributes(activeNode, tokens);
        }
      }
    }
  }

  /**
   * Parse list of attributes.
   */
  private parseAttributes(activeNode: ParserNode, tokens: Lexem[]) {
    log.debug('Parsing attributes.');
    // parse attributes
    let token = tokens.shift();
    log.debug('attribute token: %j', token);
    while (token && token.type === LEXEM_ATTRIBUTE_NAME) {
      log.debug('attribute start');
      const attributeName = token.content;
      tokens.shift();
      token = tokens.shift();
      if (!token) return;
      const attributeValue = token.content;
      activeNode.attributes.custom = activeNode.attributes.custom || {};
      activeNode.attributes.custom[attributeName] = attributeValue;
      log.debug('storing attribute with name %s and value %s', attributeName, attributeValue);
      token = tokens.shift();
    }
    return token;
  }

  private pushError(index: number, line: string, name: string, text: string) {
    log.warn('Parse Error (%s) on line %i (%s): %s', name, index, line, text);
    // TODO store error in object
    // this.parsedLine.errors.push({line: this.parsedLine.line, content: this.parsedLine.content, name, text});
  }
}
