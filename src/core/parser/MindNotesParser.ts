
import { Lexem } from "./lexer/Lexem";
import { LEXEM_EMPTY_LINE, LEXEM_INDENT, LEXEM_NODE_TEXT } from "./lexer/LexemType";
import { MindNotesLexer } from "./lexer/MindNotesLexer";
import { LineParser } from "./LineParser";
import { ParserTree } from "./tree/ParserTree";
import { ParseEvent } from "../events/EventTypes";
import { PARSER_LOGGER } from "./logger";

const log = PARSER_LOGGER('parser');

export interface ParserResult {
    tree: ParserTree;
    parsedLines: ParsedLine[];
    events: ParseEvent[];
    errors: ParseError[];
}

export interface ParseError {
    name: string;
    line: number;
    content: string;
    text: string;
}

export interface ParsedLine {
    line: number;
    indentation: number;
    content: string;
    events: ParseEvent[];
    errors: ParseError[];
}


export class MindNotesParser {

    private lexer: MindNotesLexer = new MindNotesLexer();

    tree: ParserTree = new ParserTree();
    textLines: string[] = [];
    private lineParser: LineParser = new LineParser(this.tree);

    public parse(text: string): ParserResult {
        const result: ParserResult = {
            tree: this.tree,
            parsedLines: [],
            events: [],
            errors: []
        };
        this.refreshText(text);

        // separate lines

        log.verbose('Parsing %i lines', this.textLines.length);

        this.textLines.forEach((line, index) => {
            this.lineParser.start(index, line);
            this.parseLine(this.lineParser);
            const lineResult = this.lineParser.finish();
            log.verbose('Got line result: ', lineResult);

            // TODO optimize copying
            result.errors = result.errors.concat(lineResult.errors);
            result.events = result.events.concat(lineResult.events);
        });

        return result;
    }

    public edit(startLine: number, startCharacter: number, endLine: number, endCharacter: number, newText: string): ParserResult {
        const result: ParserResult = {
            tree: this.tree,
            parsedLines: [],
            events: [],
            errors: []
        };

        log.verbose('Editing lines, start=(%i, %i), end=(%i, %i), newText="%s"', startLine, startCharacter, endLine, endCharacter, newText.replace(/\r?\n/g, '\\n'));
        // separate lines of input text
        const textChangeLines = newText.split(/\r?\n/);
        log.debug('Changing %i lines.', textChangeLines.length);
        log.debug('Split:', JSON.stringify(textChangeLines));

        const affectedExistingLines = endLine - startLine + 1;
        // const remainingChangedLines = textChangeLines.length - affectedExistingLines;
        log.debug('Change affects %i existing lines.', affectedExistingLines);
        // log.verbose('Remaining changed lines = %i.', remainingChangedLines);
        
        let exLineIndex = -1;
        let index = 0;
        for (; index < textChangeLines.length && exLineIndex < endLine; index++) {
            const newLine = textChangeLines[index];
            log.debug('New line "%s"', newLine);

            exLineIndex = index + startLine;
            log.debug('exLineIndex %i', exLineIndex);
            let curStartChar = undefined;
            let curEndChar = undefined;
            log.debug('Existing line %s', this.textLines[exLineIndex]);

            if (exLineIndex === startLine) {
                curStartChar = startCharacter;
            }
            if (exLineIndex === endLine) {
                curEndChar = endCharacter;
            }
            log.debug('curStartCar=%i, curEndChar=%i', curStartChar, curEndChar);
            this.textLines[exLineIndex] = this.replaceString(
                this.textLines[exLineIndex] || '',
                curStartChar,
                curEndChar,
                newLine);

            // reparse changed line
            log.debug('Reparsing line %i (%s)', index, this.textLines[exLineIndex]);
            this.lineParser.start(exLineIndex, this.textLines[exLineIndex]);
            this.parseLine(this.lineParser);
            const lineResult = this.lineParser.finish();
            this.combineParserResult(result, lineResult);

        }
        log.debug('New lines: ', JSON.stringify(this.textLines));
        log.debug('index=%i, affectedLines=%i', index, affectedExistingLines);

        let removedLines = 0;
        if (textChangeLines.length < affectedExistingLines) {
            // delete lines that previously existed but that are sqashed through the edit
            removedLines = this.textLines.splice(index + startLine, affectedExistingLines - index).length;
            log.debug('Removing %i lines that were squashed by the change', removedLines);

            // explicitly remove bottom lines
            for (let i = 0; i < removedLines; i++) {
                log.debug('Deleting internal line %i', index + startLine + i);
                this.lineParser.start(index + startLine, '');
                const lineResult = this.lineParser.deleteLine();
                this.lineParser.finish();
                this.combineParserResult(result, lineResult);
            }
        }
        
        if (textChangeLines.length > affectedExistingLines) {
            // insert remaining changed lines
            log.verbose('Adding remaining lines');
            for (let i = index; i < textChangeLines.length; i++) {
                this.textLines.splice(startLine + index + i - 1, 0, textChangeLines[i]);
                
                this.lineParser.start(startLine + index + i - 1, textChangeLines[i]);
                const lineResult = this.lineParser.insertLine();
                // this.lineParser.start(startLine + index + i - 1, this.textLines[startLine + index + i]);
                this.parseLine(this.lineParser);
                this.lineParser.finish();
                this.combineParserResult(result, lineResult);
            }
        }

        log.verbose('Lines after edit: %s', JSON.stringify(this.textLines));


        return result;
    }

    private combineParserResult(parserResult: ParserResult, lineResult: ParsedLine) {
        log.debug('Got line result: ', lineResult);
        // TODO optimize copying
        parserResult.errors = parserResult.errors.concat(lineResult.errors);
        parserResult.events = parserResult.events.concat(lineResult.events);
    }

    private replaceString(input: string, start: number | undefined, end: number | undefined, newText: string): string {
        if (start === undefined && end === undefined) {
            return newText;
        }
        if (end === undefined) {
            return input.substring(0, start) + newText;
        }
        if (start === undefined) {
            return newText + input.substring(end);
        }
        return input.substring(0, start) + newText + input.substring(end);
    }

    /**
     * Parses a line. Each line has the format (indent?)(content).
     * 
     * @param line 
     * @param content 
     * @param tree 
     */
    private parseLine(lineParser: LineParser) {
        const content = lineParser.lineContent;

        // extract line tokens
        const lexerResult = this.lexer.tokenizeLine(content);
        const tokens = lexerResult.lexems;
        log.debug('Got tokens for line: ', tokens);
        
        if (!tokens.length) {
            lineParser.pushError('UnprocessableLine', 'No tokens identified for line!');
            return;
        }

        // process tokens
        let token: Lexem | undefined;
        token = tokens[0]; // first token

        // extract indent
        let indent = 0;
        if (token?.type === LEXEM_INDENT) {
            indent = token.content.length;
            log.debug('indentation=%i', indent);
            tokens.shift();
            token = tokens[0];
        }
        lineParser.indentation = indent;

        // extract previous state
        const previousNode = lineParser.getPreviousNode();
        const existingNode = lineParser.getExistingNode();
        
        // line content
        if (!previousNode && !existingNode && token?.type !== LEXEM_EMPTY_LINE) {
            log.debug('This is the root node - no previous node');
            // no active node - this is the first root node
            if (token?.type === LEXEM_NODE_TEXT) {
                lineParser.addNewNode(token.content);
            } else {
                // report error
                lineParser.pushError('RootNode', 'Root node has to start with text.');
            }
        } else {
            if (existingNode) {
                existingNode.handleLineChange(tokens, lineParser);
            } else if (previousNode) {
                previousNode.handleLineChange(tokens, lineParser);
            }
        }
    }

    private refreshText(text: string) {
        this.textLines = text.split(/\r?\n/);
    }

}
