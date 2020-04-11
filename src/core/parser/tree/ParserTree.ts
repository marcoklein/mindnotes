import { ParserNode } from "./ParserNode";
import { parserLogger } from "../logger.parser";
const log = parserLogger('tree');

/**
 * Manages the insertion and deletion of nodes and lines.
 */
export class ParserTree {

    public static INITIAL_NODE_ID = 1;

    private lastId: number = ParserTree.INITIAL_NODE_ID;

    private _nodes: {[id: number]: ParserNode} = {};

    /**
     * Internal array mapping document lines to ParserNodes.
     */
    private _nodesAtLine: Array<ParserNode | undefined> = [];

    /**
     * 
     * @param lineNumber 
     */
    getNodeOfLine(lineNumber: number): ParserNode | undefined {
        if (lineNumber < 0 || this._nodesAtLine.length < lineNumber) {
            return undefined;
        }
        return this._nodesAtLine[lineNumber];
    }

    /**
     * Adds a new node at the given line.
     * 
     * @param line 
     * @param indentation 
     * @param text 
     */
    addNewParserNode(line: number, indentation: number, text: string): ParserNode {
        const id = this.generateNodeId();
        
        log.debug('Adding new parse node to line %i (%s)', line, text);
        const existing = this.getNodeOfLine(line);
        const previousNode = this.getNodeOfLine(line - 1);
        const newNode = new ParserNode(id, this, indentation, text);

        if (existing && existing !== previousNode) {
            log.error('Existing (%i, %s) equals previous (%i, %s)', existing?.id, existing?.headText, previousNode?.id, previousNode?.headText);
            throw new Error('Cannot add node to a line that already contains a node head.');
        }
        
        // evaluate node type depending on indentation
        if (!previousNode || previousNode.indentation === indentation) {
            // rootNode (no previous node) or sibling (same indentation)
            newNode.successor = previousNode?.successor;
            if (previousNode) {
                if (previousNode.successor) {
                    previousNode.successor.predecessor = newNode;
                }
                previousNode.successor = newNode;
            }
            newNode.predecessor = previousNode;
            newNode.parent = previousNode?.parent;
            log.debug('Added as sibling');

        } else if (previousNode.indentation < indentation) {
            // add a child
            newNode.parent = previousNode;
            let successor = this.getNodeOfLine(line + 1);
            if (successor) {
                if (successor.indentation === newNode.indentation) {
                    // same level as succeeding child
                    successor.predecessor = newNode;
                    newNode.successor = successor;
                } else if (successor.indentation > newNode.indentation) {
                    successor.parent = newNode;
                } // .. else succeeding node is a parent node
            }
            log.debug('Added as child of node %i (%s)', newNode.parent.id, newNode.parent.headText);
        } else {
            // indentation decreased
            // move up until we hit the same sibling
            let predecessor: ParserNode | undefined = previousNode;
            while (predecessor && predecessor.indentation > newNode.indentation) {
                predecessor = predecessor.parent;
            }
            if (predecessor) {
                log.debug('Found predecessor %i (%s)', predecessor.id, predecessor.headText);
                if (predecessor.indentation !== indentation) {
                    log.warn('Moved up node but sibling has not exactly the same indentation.'
                            + 'Predecessor has %i, newNode has %i',
                    predecessor.indentation, newNode.indentation);
                    throw new Error('Indentation of parent node is not matching.');
                }
                // update predecessor
                if (predecessor.successor) {
                    predecessor.successor.predecessor = newNode;
                }
                newNode.parent = predecessor.parent;
                newNode.successor = predecessor.successor;
                predecessor.successor = newNode;
                newNode.predecessor = predecessor;

                // update successor
                let successor = this.getNodeOfLine(line + 1);
                if (successor) {
                    if (successor.indentation > newNode.indentation) {
                        // successor is a child element
                        // => we divided two childs, update parents accordingly
                        previousNode.successor = undefined;
                        successor.predecessor = undefined;
                        successor.parent = newNode;
                    } // .. else succeeding node is a parent node or a sibling
                }
                log.debug('Added as parent');

            } else {
                throw new Error('Found no predecessor but decreased indentation. Is there space on the root node?');
            }
        }
        if (this._nodes[id]) {
            throw new Error('Duplicated Node id: ' + id);
        }
        this._nodes[id] = newNode;
        this._nodesAtLine[line] = newNode;
        return newNode;
    }

    /**
     * Inserts a new line at the given line number applying the respective previous node.
     * e.g. 0 would insert a line at the beginning
     * 
     * @param line 
     */
    insertLine(line: number) {
        log.debug(`Inserting line at ${line}`);
        // TODO use push for end?
        this._nodesAtLine.splice(line, 0, undefined);
        this.applyLine(line);
    }

    /**
     * Returns the indentation of the previous Node for the given line.
     * If there is no Node yet (no root node) 0 is returned.
     */
    prevIndent(lineNumber: number): number {
        lineNumber--; // previous line number
        if (lineNumber < 0 || this._nodesAtLine.length < lineNumber) {
            return 0;
        }
        const entry = this._nodesAtLine[lineNumber];
        return !entry ? 0 : entry.indentation;
    }

    private generateNodeId(): number {
        return this.lastId++;
    }
    
    getNodeById(id: number) {
        return this._nodes[id];
    }
    
    applyLine(line: number) {
        const curNode = this.getNodeOfLine(line);
        this._nodesAtLine[line] = curNode === undefined ? this.getNodeOfLine(line - 1) : curNode;
        log.debug('Applied node %i (%s) to line %i', this._nodesAtLine[line]?.id, this._nodesAtLine[line]?.headText, line);
    }


    get nodesAtLine(): Array<ParserNode | undefined> {
        return this._nodesAtLine;
    }

}