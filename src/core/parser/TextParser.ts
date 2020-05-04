import { ParserTree } from "./ParserTree";

const NEWLINE_SPLIT_REGEX = /\r?\n/;

/**
 * Parses text changes and adjusts the internal ParseTree.
 * 
 * The text parser is responsible of proper reparsing for the ParseTree to be up to date.
 */
export class TextParser {

    private textLines: string[] = [];
    private tree: ParserTree = new ParserTree();

    private reset(text: string) {
        this.textLines = text.split(NEWLINE_SPLIT_REGEX);
        this.tree = this.tree;
    }

    /**
     * Parses the given text.
     * All cached data is removed.
     * <p>
     * If you want to update the text use edit().
     * 
     * @param text 
     */
    parse(text: string) {
        this.reset(text);

        // insert new text lines
        this.textLines.forEach((content, index) => {
            this.tree.insertLine(index, content);
        });
    }

    /**
     * Edits the underlying text by replacing the specified range with the new text content.
     * 
     * @param startLine 
     * @param startCharacter 
     * @param endLine 
     * @param endCharacter 
     * @param newText 
     */
    edit(startLine: number, startCharacter: number, endLine: number, endCharacter: number, newText: string) {
        // TODO
        throw new Error('Editing text is not supported yet');
    }

}