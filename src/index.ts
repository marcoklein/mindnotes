import { SerializedEventEmitter } from "./core/events/EventHandler";
import { EventRenderer } from "./renderer/EventRenderer";
import { TextEditor } from "./editor/TextEditor";

/**
 * Initialize TextArea and Renderer for Mindnotes.
 * Both components share an event emitter function to exchange events.
 */
(() => {
    
    const emitter = new SerializedEventEmitter();
    new EventRenderer(emitter);
    new TextEditor(emitter);

})();