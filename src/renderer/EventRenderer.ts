
import { MindmapView } from "./graph/MindmapView";
import { SerializedEventEmitter } from "../core/events/EventHandler";
import { AddNodeEvent, EditNodeEvent, DeleteNodeEvent } from "../core/events/EventTypes";

/**
 * Handles incoming NodeEvents and applies them to the Mindmap.
 */
export class EventRenderer {

    private eventHandler: SerializedEventEmitter;
    private mindmap: MindmapView;

    constructor(eventHandler: SerializedEventEmitter) {
        this.eventHandler = eventHandler;
        this.initEventHandlers();
        this.mindmap = this.initMindmap();
    }

    private initEventHandlers() {
        this.eventHandler.registerHandler(AddNodeEvent.NAME, this.handlers.addNodeEvent);
        this.eventHandler.registerHandler(EditNodeEvent.NAME, this.handlers.editNodeEvent);
        this.eventHandler.registerHandler(DeleteNodeEvent.NAME, this.handlers.deleteNodeEvent);
    }

    private handlers = {
        addNodeEvent: (event: AddNodeEvent) => {
            console.log('Received event in handler: ', event);
            const parentId = event.parentId !== undefined ? '' + event.parentId : undefined;
            this.mindmap.addNewNode('' + event.id, event.text).changeParent(parentId);
        },
        editNodeEvent: (event: EditNodeEvent) => {
            console.log('Received event in handler: ', event);
            // find node
            const node = this.mindmap.getNode('' + event.id);
            if (!node) {
                console.error('No Node with id ' + event.id);
                return;
            }
            node.changeParent(event.parentId !== undefined ? '' + event.parentId : undefined);
            node.changeText(event.text, 0);
        },
        deleteNodeEvent: (event: DeleteNodeEvent) => {
            console.log('Received event in handler: ', event);
            // find node
            const node = this.mindmap.getNode('' + event.id);
            if (!node) {
                console.error('No Node with id ' + event.id);
                return;
            }
            node.remove();
        }
    };

    private initMindmap() {
        let mindmap = new MindmapView();

        return mindmap;
    }

}