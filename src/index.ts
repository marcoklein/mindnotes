import { SerializedEventEmitter } from "./core/events/EventHandler";
import { AddNodeEvent, EditNodeEvent } from "./core/events/EventTypes";
import { EventRenderer } from "./renderer/EventRenderer";

(() => {
    const emitter = new SerializedEventEmitter();
    const renderer = new EventRenderer(emitter);
    
    testRenderer(emitter);
})();

/**
 * For testing.
 * 
 * Fills up renderer with test events.
 */
function testRenderer(emitter: SerializedEventEmitter) {
    emitter.emit(new AddNodeEvent(1, undefined, 'root'));
    emitter.emit(new AddNodeEvent(2, 1, 'parent'));
    emitter.emit(new AddNodeEvent(3, 2, 'childA'));
    emitter.emit(new AddNodeEvent(4, 2, 'childB'));
    emitter.emit(new AddNodeEvent(5, 1, 'sibling'));

    emitter.emit(new EditNodeEvent(2, undefined, 'parent edit'));
}