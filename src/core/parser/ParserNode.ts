import { ParserLine } from "./ParserLine";
import { ParserTree } from "./ParserTree";

export interface NodeEffect {
    activate(index: number, node: ParserNode): void;
    update(index: number, node: ParserNode): void;
    deactivate(index: number, node: ParserNode): void;
}

export class TextNodeEffect implements NodeEffect {

    private lineIndex: number = -1;
    private text: string;

    constructor(text: string) {
        this.text = text;
    }

    activate(index: number, node: ParserNode): void {
        // TODO supply with index of node...
        // node.textLines[index] = 
        this.lineIndex = node.textLines.push(this.text) - 1;
    }

    update(index: number, node: ParserNode): void {
        node.textLines[index] = this.text;
    }

    deactivate(index: number, node: ParserNode): void {
        node.textLines.splice(index, 1);
    }

}

/**
 * Holds information about a block of text, called "node".
 * It holds all lines that affect node attributes.
 */
export class ParserNode {

    id: string;
    tree: ParserTree;
    lines: ParserLine[] = [];

    // attributes
    textLines: string[] = [];
    color?: string;

    constructor(id: string, tree: ParserTree) {
        this.id = id;
        this.tree = tree;
    }

    // getText(): string {
    //     return this.;
    // }

    // getColor(): string {
    //     return this.effects
    //         .filter(e => )
    // }

    /**
     * Refresh attributes only if line is inserted or deleted.
     */
    refreshEffects() {
        // TODO clear attributes on refresh!
        this.lines.forEach((e, index) => e.effects.forEach(e => e.update(index, this)))
    }

    getIndentation() {
        return this.lines[0].indentation;
    }

}
