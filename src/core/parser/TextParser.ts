import { MindNotesLexer } from "./lexer/MindNotesLexer";
import { ParserTree } from "./ParserTree";
import { Lexem } from "./lexer/Lexem";
import { LEXEM_INDENT, LEXEM_NODE_TEXT, LEXEM_EMPTY_LINE } from "./lexer/LexemType";
import { ParserTreeBuilder } from "./ParserTreeBuilder";
import { parserLogger } from "./logger.parser";

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
        log.debug('Got tokens for line: ', tokens);
        
        if (!tokens.length) {
            this.pushError(index, line, 'UnprocessableLine', 'No tokens identified for line!');
            return;
        }

        // process tokens
        let token: Lexem | undefined;
        token = tokens[0]; // first token

        // extract indent
        let indent = 0;
        if (token?.type === LEXEM_INDENT) {
            indent = token.content.length;
            tokens.shift();
            token = tokens[0];
        }
        log.debug('indentation=%i', indent);

        // extract previous state
        const activeNode = builder.getActive();
        log.debug('active indentation=%i', activeNode.indentation);

        if (token.type === LEXEM_EMPTY_LINE) {
            // empty line actives multiline flag of active node
            activeNode.attributes = activeNode.attributes || {};
            activeNode.attributes.multiline = true;
        } else {
            // check indent
            if (indent === activeNode.indentation) {
                // same indentation
                // add to same level
                // TODO multiline for activeNode enabled?
                
                if (token.type === LEXEM_NODE_TEXT) {
                    // new node
                    // replace on node stack
                    builder.pushSibling(indent, token.content);
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
                }
            }
        }
        
    }

    private pushError(index: number, line: string, name: string, text: string) {
        log.warn('Parse Error (%s) on line %i (%s): %s', name, index, line, text);
        // TODO store error in object
        // this.parsedLine.errors.push({line: this.parsedLine.line, content: this.parsedLine.content, name, text});
    };
}