
import { MindnotesRenderer } from "./renderer/EventRenderer";
import { TextEditor } from "./editor/TextEditor";
import { LocalNetworkAdapter } from "./core/network/LocalTransmitter";

/**
 * Initialize TextArea and Renderer for Mindnotes.
 * Both components share an event emitter function to exchange events.
 */
(() => {
    
    const rendererTransmitter = new LocalNetworkAdapter();
    const editorTransmitter = new LocalNetworkAdapter();

    rendererTransmitter.peer = editorTransmitter;
    editorTransmitter.peer = rendererTransmitter;

    new MindnotesRenderer(rendererTransmitter);
    new TextEditor(editorTransmitter);

})();