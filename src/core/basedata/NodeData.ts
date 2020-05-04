

export abstract class PropertyEmitter<T> {

}


export class Property<T> {

    private property: T;

    constructor(property: T) {
        this.property = property;
    }

    set(property: T) {
        this.property = property;
    }

    get(): T {
        return this.property;
    }
}

/**
 * Listen to changes of a property.
 */
export interface PropertyObserver<T> {
    
}

export class ListProperty<T> {
    private property: T[] = [];

    constructor() {
        this.property = [];
    }

    get(): T[] {
        return this.property;
    }
}

export class NodeAttributes {
    textLines: ListProperty<string> = new ListProperty<string>();
}


export class NodeData {
    /**
     * Unique identifier for this node.
     */
    id: string;

    constructor(id: string) {
        this.id = id;
    }



}