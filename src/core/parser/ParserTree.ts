import { ParserLine } from "./ParserLine";
import { parserLogger } from "./logger.parser";
import { ParserNode } from "./ParserNode";
const log = parserLogger('tree');

/**
 * Holds all information about the current parse state.
 * Maps nodes to lines.
 * 
 * <p>
 * 
 * Called by the TextParser to update single lines.
 * Reparses complete nodes if parsing resolves an error.
 * 
 * A line can either be
 * 1. inserted
 * 2. updated
 * 3. deleted
 * 
 * The ParserTree notifies underlying ParserLines for occuring changes.
 */
export class ParserTree {

    private lines: ParserLine[] = [];

    /**
     * Insert a new line.
     * 
     * @param line 
     */
    insertLine(index: number, content: string) {
        // update adjacent lines
        const precedingLine = this.getLineAt(index - 1);
        const succeedingLine = this.getLineAt(index);
        const insertedLine = new ParserLine(this, precedingLine, succeedingLine);
        if (precedingLine) {
            precedingLine.successor = insertedLine;
        }
        if (succeedingLine) {
            succeedingLine.predecessor = insertedLine;
        }

        // insert line
        this.lines.splice(index, 0, insertedLine);

        // parse and apply line content
        insertedLine.onInsert(index, content);
    }

    updateLine(index: number, content: string) {

    }

    deleteLine(index: number) {

    }

    getLineAt(index: number) {
        return index < 0 || index >= this.lines.length ? undefined : this.lines[index];
    }

    insertNode(index: number): ParserNode {
        throw new Error('Function not implemented yet.');
    }

}
