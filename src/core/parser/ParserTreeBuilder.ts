import { ParserNode, ParserTree } from './ParserTree';
import { parserLogger } from './logger.parser';

const log = parserLogger('builder');

export class ParserTreeBuilder {
  private tree: ParserTree;

  /**
   * Always contains the currently active node.
   */
  private nodeStack: ParserNode[] = [];

  constructor() {
    this.tree = {
      indentation: -1,
      children: [],
      errors: [],
      attributes: {},
    };
    this.nodeStack = [this.tree];
  }

  /**
   * Pops all nodes from the stack until the given indentation is reached.
   * Returns undefined, if no matching indentation is found.
   */
  popToIndent(indent: number): ParserNode | undefined {
    let parent = this.getParentNode();
    // loop through stack, until we hit sibling with same indentation
    while (parent && parent.indentation >= indent) {
      this.nodeStack.pop();
      parent = this.getParentNode();
    }
    return parent;
  }

  /**
   * Pushes a new sibling.
   *
   * @param indent
   * @param text
   */
  pushSibling(indent: number, text: string): ParserTreeBuilder {
    const sibling = this.newEmptyNode();
    sibling.indentation = indent;
    sibling.attributes.text = text;
    log.info('prev on stack:', this.nodeStack[this.nodeStack.length - 1].attributes.text);
    this.nodeStack[this.nodeStack.length - 1] = sibling;
    this.nodeStack[this.nodeStack.length - 2].children.push(sibling);
    log.info('pushed sibling as child of', this.nodeStack[this.nodeStack.length - 2].attributes.text);
    return this;
  }

  /**
   * Appends a new child to end of stack.
   *
   * @param indent
   * @param text
   */
  pushChild(indent: number, text: string): ParserTreeBuilder {
    const child = this.newEmptyNode();
    child.indentation = indent;
    child.attributes.text = text;
    this.nodeStack[this.nodeStack.length - 1].children.push(child);
    this.nodeStack.push(child);
    return this;
  }

  /**
   * Currently active node.
   */
  getTopNode() {
    return this.nodeStack[this.nodeStack.length - 1];
  }

  private getParentNode() {
    return this.nodeStack[this.nodeStack.length - 2];
  }

  /**
   * Retrieve the complete ParserTree.
   */
  build(): ParserTree {
    return this.tree;
  }

  /**
   * Creates a simple, empty new node with no attributes and -1 indentation.
   */
  private newEmptyNode(): ParserNode {
    return {
      indentation: -1,
      attributes: {},
      errors: [],
      children: [],
    };
  }
}
