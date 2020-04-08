
import { SerializableEvent } from "./EventTypes";


export type SerializedEventHandler = (event: any) => void;

export class SerializedEventEmitter {
    handlers: {[id: string]: SerializedEventHandler} = {};

    constructor() {
    }

    public registerHandler(eventName: string, handler: SerializedEventHandler) {
        this.handlers[eventName] = handler;
    }

    public handleSerializedEvent(eventJson: string) {
        const data = JSON.parse(eventJson);
        this.emit(data as SerializableEvent);
    }

    public emit(event: SerializableEvent) {
        const handler = this.handlers[event.name];
        console.log('SerializedEventEmitter: emitting event', event, handler);
        if (handler) {
            handler(event);
        }
    }

}
