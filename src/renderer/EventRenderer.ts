import { MindmapView } from './graph/MindmapView';
import { NetworkAdapter } from '../core/network/AbstractNetworkAdapter';
import { rendererLogger } from '../logger';
import * as jsondiffpatch from 'jsondiffpatch';
import { ParserTreeInterpreter } from './ParserTreeInterpreter';
import { ParserTree } from '../core/parser/ParserTree';

const log = rendererLogger('renderer');

/**
 * Handles incoming NodeEvents and applies them to the Mindmap.
 */
export class MindnotesRenderer {
  private network: NetworkAdapter;
  private mindmap: MindmapView;
  private interpreter: ParserTreeInterpreter;

  constructor(network: NetworkAdapter) {
    this.network = network;
    this.initEventHandlers();
    this.mindmap = this.initMindmap();
    this.interpreter = new ParserTreeInterpreter(this.mindmap);
  }

  private initEventHandlers() {
    this.network.addCallback(this.messageListener);
  }

  private messageListener = (message: any) => {
    log.debug('Received diff message on renderer.');
    log.debug(JSON.stringify(message));
    this.applyDiff(message);
  };

  private initMindmap() {
    let mindmap = new MindmapView();
    return mindmap;
  }

  private applyDiff(message: any) {
    // interpret patch message
    this.interpreter.patch(message);
  }

  private updateNode() {}

  private addNode() {}

  private removeNode() {}
}
