
export interface SerializableEvent {
    name: string;
}

export interface LowerEventDecorator extends SerializableEvent {
    customProp: string;
}

export abstract class ParseEvent implements SerializableEvent {
    constructor(public name: string) {}
}

export abstract class NodeEvent extends ParseEvent {
    public static NAME = 'node';
    constructor(public name: string, public id: number) {
        super(name);
    }
}

export class AddNodeEvent extends NodeEvent {
    public static NAME = 'node.add';
    constructor(public id: number, public parentId: number | undefined, public text: string) {
        super(AddNodeEvent.NAME, id);
    }
}

export class EditNodeEvent extends NodeEvent {
    public static NAME = 'node.edit';
    constructor(public id: number, public parentId: number | undefined, public text: string) {
        super(EditNodeEvent.NAME, id);
    }
}

export class DeleteNodeEvent extends NodeEvent {
    public static NAME = 'node.delete';
    constructor(public id: number) {
        super(DeleteNodeEvent.NAME, id);
    }
}
