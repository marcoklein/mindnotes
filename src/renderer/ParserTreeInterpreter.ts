import { ParserNode, ParserTree } from "../core/parser/ParserTree";
import { MindmapView } from "./graph/MindmapView";
import { GraphNode } from "./graph/GraphNode";
import * as jsondiffpatch from "jsondiffpatch";
import { rendererLogger } from "../logger";

const log = rendererLogger('interpreter');


// export interface test implements jsondiffpatch.Filter<jsondiffpatch.PatchContext> {
//     (context: jsondiffpatch.PatchContext): => {

//     };
//     filterName = 'bla';
// }

/**
 * Information about renderer tree.
 */
interface RendererGraphNode {
    graphNode: GraphNode | undefined;
    children: RendererGraphNode[];
}

interface DiffMessage {
    attributes: {
        text: string[]
    };
    children: {[index: string]: DiffMessage};
}

/**
 * Updates the renderer via patch messages from the text editor.
 */
export class ParserTreeInterpreter {

    private view: MindmapView;
    private lastId = 0;

    private root: RendererGraphNode | undefined;

    

    constructor(view: MindmapView) {
        this.view = view;
    }

    /**
     * Patch message created by jsondiffpatch.
     * 
     * @param message 
     */
    patch(message: any) {
        this.root = this.patchDelta(this.root, undefined, message);
    }

    private insertNode(curNode: RendererGraphNode, parentNode: RendererGraphNode | undefined, message: ParserNode): RendererGraphNode {
        if (parentNode) {
            // insert graph node if a parent is defined
            let graphNode = this.view.addNewNode(this.generateId(), '');

            // map attributes
            graphNode.changeText(message.attributes.text ? message.attributes.text : '', 0);
            graphNode.changeParent(parentNode.graphNode?.id);

            curNode.graphNode = graphNode;
        }

        // insert children
        if (message.children) {
            message.children.forEach(child => {
                const childNode: RendererGraphNode = {
                    children: [],
                    graphNode: undefined,
                };
                curNode.children.push(this.insertNode(childNode, curNode, child));
            });
        }

        return curNode;
    }

    /**
     * Traverse through delta message and patch renderer tree.
     */
    private patchDelta(curNode: RendererGraphNode | undefined, parentNode: RendererGraphNode | undefined, delta: any): RendererGraphNode {
        if (Array.isArray(delta)) {
            log.debug('Patching new node');
            // array means that something got inserted / replaced
            if (!curNode) {
                curNode = {
                    children: [],
                    graphNode: undefined,
                };
                // insert new node
                curNode = this.insertNode(curNode, parentNode, delta[0]);
            } else {
                throw new Error('Patch delta child insert with exiting cur node.');
            }
        } else if (curNode) {
            const definedCurNode = curNode;
            // 1. update attributes
            if (delta.attributes) {
                log.debug('Updating attributes');

                if (Array.isArray(delta.attributes.text)) {
                    curNode?.graphNode?.changeText(delta.attributes.text[1], 0);
                }
            }
            
            // 2. traverse children
            if (delta.children) {
                log.debug('Traversing children');
                Object.keys(delta.children).forEach((key: any) => {
                    log.trace('Child key %s', key);
                    if (/\d+/.test(key)) {
                        log.trace('Existing child');
                        // existing array element
                        let childDelta = delta.children[key];
                        definedCurNode.children[key] = this.patchDelta(definedCurNode.children[key], curNode, childDelta);
                    } else if (/_\d+/.test(key)) {
                        log.trace('Deleted child');
                        // deleting existing array element
                        throw new Error('Deletion not supported yet');
                    }
                });
            }

        } else {
            throw new Error('Existing node is undefined but no insert retrieved.');
        }

        return curNode;
    }

    private generateId(): string {
        return '' + this.lastId++;
    }


}