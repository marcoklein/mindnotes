import { ParsedLine } from "./MindNotesParser";
import { ParserTree } from "./tree/ParserTree";
import { ParserNode } from "./tree/ParserNode";
import { PARSER_LOGGER } from "./logger";
import { ParseEvent, EditNodeEvent, DeleteNodeEvent, AddNodeEvent } from "../events/EventTypes";

const log = PARSER_LOGGER('line');

/**
 * Handles parsing of a single line.
 * <p>
 * Identifies the active node for the parsed line and forwards the parsing request.
 * If no active node exists (entry of document) either a new node is being created or the line
 * is skipped.
 * <p>
 * Provides utility functions for the parsing process. These incorporate the collection of node changes and firing of events.
 */
export class LineParser {
    
    readonly tree: ParserTree;
    /**
     * Result of the current line parsing.
     */
    private parsedLine: ParsedLine;
    private started: boolean = false;

    constructor(tree: ParserTree) {
        this.tree = tree;
        this.parsedLine = this.createNewParsedLine(-1, '');
    }

    /**
     * Initializes the LineParser to be used for a line.
     * Has to be called before finish().
     * 
     * @param line 
     * @param content 
     */
    start(line: number, content: string) {
        this.started = true;
        this.parsedLine = {
            line,
            indentation: 0,
            content,
            events: [],
            errors: []
        };
    }

    /**
     * Deletes the current line.
     */
    deleteLine(): ParsedLine {
        const node = this.tree.nodesAtLine[this.parsedLine.line];
        log.debug('Deleting line from node "%s"', node?.headText);
        if (node) {
            if (this.getPreviousNode() !== node) {
                log.debug('Removing node');
                // remove node - its the head
                this.deleteNode(node);
            } else {
                log.warn('Removing stuff from node body is not supported');
                // remove something from the node
                // node.deleteLine() ?
            }
        }
        this.tree.nodesAtLine.splice(this.parsedLine.line, 1);
        return this.parsedLine;
    }

    /**
     * Inserts a new line.
     */
    insertLine(): ParsedLine {
        log.debug('Inserting line at %i', this.parsedLine.line);
        this.tree.insertLine(this.parsedLine.line);
        return this.parsedLine;
    }

    /**
     * Finished parsing a line.
     * Create a new parsed line for next line and update the ParserTree accordingly.
     */
    finish(): ParsedLine {
        if (!this.started) {
            throw this.handleNotStarted();
        }
        this.started = false;
        this.tree.applyLine(this.parsedLine.line);
        return this.parsedLine;
    }
    
    pushError(name: string, text: string) {
        if (!this.parsedLine) {
            throw this.handleNotStarted();
        }
        log.warn('Parse Error (%s) on line %i (%s): %s', name, this.parsedLine.line, this.parsedLine.content, text);
        this.parsedLine.errors.push({line: this.parsedLine.line, content: this.parsedLine.content, name, text});
    };

    pushEvent(event: ParseEvent) {
        if (!this.parsedLine) {
            throw this.handleNotStarted();
        }
        log.debug('New Event (%s) on line %i (%s): %s', event.name, this.parsedLine.line, this.parsedLine.content, JSON.stringify(event));
        this.parsedLine.events.push(event);
    };

    /**
     * Returns a node for the currently parsed line.
     * If a node is set the line has already been parsed and is being edited.
     */
    getExistingNode(): ParserNode | undefined {
        return this.parsedLine.line < this.tree.nodesAtLine.length ? this.tree.nodesAtLine[this.parsedLine.line] : undefined;
    }

    getPreviousNode(): ParserNode | undefined {
        if (this.parsedLine.line < 1) {
            // start of file with root node
            return undefined;
        }
        return this.tree.getNodeOfLine(this.parsedLine.line - 1);
    }

    getPrevIndent(): number {
        return this.tree.prevIndent(this.parsedLine.line);
    }

    editNode(node: ParserNode, text: string) {
        //log.verbose('Node at line already exists with text %s', text);
        // fire edit
        node.headText = text;
        const event = new EditNodeEvent(node.id, node.parent?.id, text);
        this.parsedLine.events.push(event);
    }

    deleteNode(node: ParserNode) {
        log.debug('Removing node "%s"', node.headText);
        // only the head of a node can be removed
        const previousNode = this.getPreviousNode();
        let curLine = this.parsedLine.line;

        // FIXME handle preceding text that is still part of the deleted node head
        do {
            this.tree.nodesAtLine[curLine] = previousNode;
            curLine++;
            // THIS PART ONLY WORKS FOR EMPTY LINES - IF MULTILINE NODES ARE USED THE CODE BREAKS
        } while (curLine < this.tree.nodesAtLine.length && this.tree.nodesAtLine[curLine] === node);

        const event = new DeleteNodeEvent(node.id);
        this.parsedLine.events.push(event);
    }

    addNewNode(text: string) {
        log.verbose('Adding new node with text %s', text);
        const parsedLine = this.parsedLine;
        const existingNode = this.getExistingNode();
        log.verbose('Number of tree lines (%i) with cur line (%i)', this.tree.nodesAtLine.length, this.parsedLine.line);
        if (existingNode) {
            log.verbose('Node at line already exists with text %s', text);
            // edit existing node
            if (existingNode.headText && existingNode.headText === text) {
                // text is same - do nothing
            } else {
                // fire edit
                existingNode.headText = text;
                const event = new EditNodeEvent(existingNode.id, existingNode.parent?.id, text);
                parsedLine.events.push(event);
            }
        } else {
            // add new node
            const node = this.tree.addNewParserNode(parsedLine.line, parsedLine.indentation, text);

            const event = new AddNodeEvent(node.id, node.parent?.id, text);
            parsedLine.events.push(event);
        }
    }

    changeNodeIndentation(node: ParserNode, newIndent: number) {
        log.debug('Node indentation update');
        if (node.indentation < newIndent) {
            // increase level -> move as child of predecessor
            if (node.predecessor) {
                if (node.predecessor.indentation === node.indentation) {
                    log.debug('Moving to new node.');
                    node.parent = node.predecessor;
                    const event = new EditNodeEvent(node.id, node.parent?.id, node.headText);
                    this.parsedLine.events.push(event);
                } else {
                    this.pushError('NoPrecedingSibling', 'Cannot update indentation.');
                    return;
                }
            } else {
                node.parent = undefined;
            }
            node.parent = node.predecessor;
        } else if (node.indentation > newIndent) {
            // decrease level -> move as sibling of parent
            if (node.parent) {
                if (node.parent.indentation === node.indentation) {
                    log.debug('Moving one parent up');
                    node.parent = node.predecessor;
                } else {
                    this.pushError('NoPrecedingSibling', 'Cannot update indentation.');
                    return;
                }
            } else {
                node.parent = undefined;
            }
            const event = new EditNodeEvent(node.id, node.parent?.id, node.headText);
            this.parsedLine.events.push(event);
        }
    }
    
    private createNewParsedLine(line: number, content: string) {
        return {
            line,
            indentation: 0,
            content,
            events: [],
            errors: []
        };
    }
    
    private handleNotStarted(): undefined {
        throw new Error('start() has to be called in order to initialize a line.');
    }

    set indentation(indent: number) {
        this.parsedLine.indentation = indent;
    }

    get indentation() {
        return this.parsedLine.indentation;
    }

    get lineContent(): string {
        return this.parsedLine.content;
    }
    
    get line(): number {
        return this.parsedLine.line;
    }

}
