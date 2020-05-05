
export interface ParserError {
    name: string;
    description: string;
}

export interface NodeAttributes {
    text?: string;
    multiline?: boolean;
}

export interface ParserNode {
    indentation: number;
    attributes: NodeAttributes;
    children: ParserNode[];
    errors: ParserError[];
}

export interface ParserTree extends ParserNode {
}