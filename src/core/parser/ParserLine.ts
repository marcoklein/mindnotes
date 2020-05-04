import { ParserTree } from "./ParserTree";
import { ParserNode, NodeEffect } from "./ParserNode";
import { parserLogger } from "./logger.parser";
const log = parserLogger('parserline');

export interface LineHandler {
    interpret(content: string, parserLine: ParserLine): boolean;
}

export class TextHandler implements LineHandler {

    interpret(content: string, parserLine: ParserLine): boolean {
        // handle content
        return true;
    }

}

export class MultilineTextHandler implements LineHandler {
    
    interpret(content: string, parserLine: ParserLine): boolean {
        const split = content.split(/(\+)\s*(.*)/);
        if (split.length) {
            return true;
        }
        return false;
    }
    
}

/**
 * Single line that is always part of a node.
 * <p>
 * ParserLines represent "real" text lines and get inserted by the ParserTree.
 * The parser line updates the parser tree and affecting nodes by itself.
 */
export class ParserLine {
    /**
     * RegEx to split up a text line into indentation and content.
     */
    private LINE_REGEX = /^(\s*)(.*)/;

    readonly tree: ParserTree;
    /**
     * Node this line is a parent of.
     */
    node?: ParserNode;
    indentation: number = 0;
    content?: string;
    successor?: ParserLine;
    predecessor?: ParserLine;

    /**
     * All effects this line has on the node.
     * Effects are cached and only updated once an "update" occurs on the line.
     */
    effects: NodeEffect[] = [];

    /**
     * Initializes new ParserLine as part of the given ParserTree.
     * The line is linked to the given successor and predecessor.
     * If they are null, this line is either the first or last line respectively.
     * 
     * @param tree 
     * @param successor 
     * @param predecessor 
     */
    constructor(tree: ParserTree, successor: ParserLine | undefined, predecessor: ParserLine | undefined) {
        this.tree = tree;
        this.successor = successor;
        this.predecessor = predecessor;
    }

    /**
     * Tokenizes and parses line content.
     * 
     * @param lineContent 
     */
    onInsert(index: number, lineContent: string) {
        // tokenize line content
        const lineSplit = lineContent.split(this.LINE_REGEX);
        if (!lineSplit.length) {
            // empty line
            this.insertEmptyLine(index);
        } else {
            // content
            const indentation = lineSplit[1].length;
            const content = lineSplit[2];
            this.insertLineWithContent(index, indentation, content);
        }
    }

    /**
     * Updates the line at the given index with the given new line content.
     * 
     * @param index 
     * @param lineContent 
     */
    onUpdate(lineContent: string) {

    }

    onDelete() {
        // remove attribute effects of this node
    }
    

    private insertEmptyLine(index: number) {
        log.debug('Applying empty line, index = %i', index);
        // is there a preceding rootNode?
        if (!this.predecessor || !this.predecessor.node) {
            // no root node.. just skip line as we are still in entry phase
            return;
        }
        // this empty lines belongs to the previous node!
        this.node = this.predecessor.node;

        // TODO activate multiline flag of node if this is the line directly after a node
    }

    /**
     * 
     * @param index lineNumber
     * @param indentation 
     * @param content Line content with removed indentation.
     */
    private insertLineWithContent(index: number, indentation: number, content: string) {
        log.debug('Applying line, index = %i, indentation = %i, content = "%s"', index, indentation, content);
        this.indentation = indentation;
        // is there a preceding node?
        let activeNode: ParserNode | undefined = undefined;
        if (!this.predecessor || !this.predecessor.node) {
            // this is the root node
            activeNode = this.tree.insertNode(index);
        } else {
            activeNode = this.predecessor.node;
        }
        
        // analyze line content
        let contentSplit: string[];
        if ((contentSplit = content.split(/(\+)\s*(.*)/)).length) {
            log.debug('Parsing multiline text');
            // note: if the "+" occurs on the first line and the node is the first node
            // then either ignore the plus, or include it as the first line.. but throw no error
            // an empty line always splits nodes
            const multilineTag = contentSplit[1];
            const text = contentSplit[2];

            if (this.predecessor) {
                // evaluate preceding node
                if (activeNode.getIndentation()) {
                    // .. if more left .. if more right .. if same level
                    // TODO -> generalize these methods into a handler
                }
            } // else this is the first line

        } else if ((contentSplit = content.split(/.+/)).length) {
            log.debug('Parsing text node');
            const text = contentSplit[0];
        } else {
            throw new Error('Unable to parse line.');
        }
    }

}
