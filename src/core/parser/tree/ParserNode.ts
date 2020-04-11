import { Lexem } from "../lexer/Lexem";
import { LineParser } from "../LineParser";
import { ParserTree } from "./ParserTree";
import { LEXEM_EMPTY_LINE, LEXEM_NODE_TEXT } from "../lexer/LexemType";
import { parserLogger } from "../logger.parser";
import { AddNodeEvent } from "../../events/EventTypes";
const log = parserLogger('node');


/**
 * The parser node is responsible for one block of the text editor.
 */
export class ParserNode {

    /**
     * Unique identifier of this node.
     * Generted by the ParserTree.
     */
    id: number;
    tree: ParserTree;
    parent: ParserNode | undefined;
    /**
     * Preceding sibling.
     */
    predecessor: ParserNode | undefined;
    /**
     * Succeeding sibling.
     */
    successor: ParserNode | undefined;
    /**
     * Indentation/level/depth of the node.
     * In concrete this will be the number of spaces of the parsed line.
     */
    indentation: number;
    /**
     * First text line of the node.
     */
    headText: string;

    /**
     * Creates a new node instance.
     * Always created by a ParserTree that is also assigning a unique id.
     * 
     * @param id 
     * @param tree 
     * @param indentation 
     * @param text 
     */
    constructor(id: number, tree: ParserTree, indentation: number, text: string) {
        this.id = id;
        this.tree = tree;
        this.indentation = indentation;
        this.headText = text;
    }
    
    /**
     * Applies the given line change to this node.
     * 
     * @param tokens 
     * @param lineParser 
     */
    handleLineChange(tokens: Lexem[], lineParser: LineParser) {
        const previousNode = lineParser.getPreviousNode();
        if (this !== previousNode) {
            this.handleHeadChange(tokens, lineParser);
        } else {
            this.handleBodyChange(tokens, lineParser);
        }
    }

    private handleHeadChange(tokens: Lexem[], lineParser: LineParser) {
        const token = tokens.shift();
        const lineIndent = lineParser.indentation;

        if (token?.type === LEXEM_EMPTY_LINE) {
            // delete node
            lineParser.deleteNode(this);
        } else {
            // handle indentation change
            if (this.indentation !== lineIndent) {
                lineParser.changeNodeIndentation(this, lineIndent);
            }

            // change to the node head
            if (token?.type === LEXEM_NODE_TEXT) {
                const text = token.content;
                log.verbose('Node at line already exists with text %s', text);
                if (this.headText && this.headText !== text) {
                    // only edit if text changed
                    lineParser.editNode(this, text);
                }
            } else {
                // report error
                lineParser.pushError('NodeHeadTextChange', 'Node has to start with text.');
            }
        }
    }

    private handleBodyChange(tokens: Lexem[], lineParser: LineParser) {
        const token = tokens.shift();

        if (token?.type === LEXEM_EMPTY_LINE) {
            // TODO handle multiline text
            log.debug('Skipped empty line');
        } else if (token?.type === LEXEM_NODE_TEXT) {
            // TODO test if multiline flag is set
            log.debug('Adding new node to existing node');

            const node = this.tree.addNewParserNode(lineParser.line, lineParser.indentation, token.content);
            
            const event = new AddNodeEvent(node.id, node.parent?.id, token.content);
            lineParser.pushEvent(event);
        } else {
            log.warn('Unhandled token: ', token?.type, token?.content);
        }
    }

}