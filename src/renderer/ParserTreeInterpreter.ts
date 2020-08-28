import { ParserNode, NodeAttributes } from '../core/parser/ParserTree';
import { rendererLogger } from '../logger';
import { GraphNode } from './graph/GraphNode';
import { MindmapView } from './graph/MindmapView';

const log = rendererLogger('interpreter');

/**
 * Information about renderer tree.
 */
interface RendererGraphNode {
  graphNode: GraphNode | undefined;
  children: Array<RendererGraphNode | undefined>;
  attributes: NodeAttributes;
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
  patch(message: ParserNode) {
    this.root = this.patchDelta(this.root, undefined, message);
  }

  private insertNode(
    curNode: RendererGraphNode,
    parentNode: RendererGraphNode | undefined,
    message: ParserNode
  ) {
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
          attributes: {},
        };
        curNode.children.push(this.insertNode(childNode, curNode, child));
      });
    }

    return curNode;
  }

  private deleteNode(node: RendererGraphNode | undefined) {
    if (node === undefined) {
      throw new Error('Deleting undefined node.');
    }
    node.graphNode?.remove();
    node.children.forEach(child => {
      this.deleteNode(child);
    });
  }

  /**
   * Traverse through delta message and patch renderer tree.
   */
  private patchDelta(
    curNode: RendererGraphNode | undefined,
    parentNode: RendererGraphNode | undefined,
    delta: ParserNode
  ) {
    if (Array.isArray(delta)) {
      log.debug('Patching new node');
      // array means that something got inserted / replaced
      if (!curNode) {
        curNode = {
          children: [],
          graphNode: undefined,
          attributes: delta.attributes,
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
          if (/^\d+$/.test(key)) {
            log.trace('Existing child');
            // existing array element
            let childDelta = delta.children[key];
            definedCurNode.children[key] = this.patchDelta(definedCurNode.children[key], curNode, childDelta);
          } else if (/^_\d+$/.test(key)) {
            log.trace('Deleted child');
            const deletionIndex = Number.parseInt(key.split(/_(\d+)/)[1]);
            // deleting existing array element
            const deletedNode = definedCurNode.children[deletionIndex];
            definedCurNode.children[deletionIndex] = undefined;
            this.deleteNode(deletedNode);
          }
        });

        // clean up deleted children
        definedCurNode.children = definedCurNode.children.filter(child => child !== undefined);
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
