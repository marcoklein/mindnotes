/**
 * Single lexem or token extracted by the Lexer.
 */
export interface Lexem {
    type: string;
    content: string;
    /**
     * Index of start character.
     */
    start: number;
    /**
     * Index of end character.
     */
    end: number;
}
