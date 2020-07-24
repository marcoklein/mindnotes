import { GraphNode } from './GraphNode';
import { GraphLinkData } from './GraphLink';
import { MindmapView } from './MindmapView';
import { rendererLogger } from '../../logger';

const log = rendererLogger('graphdata');

/**
 * Data for nodes and links of the graph.
 */
export class GraphData {
  nodesMap: { [id: string]: GraphNode } = {};
  linksMap: { [id: string]: GraphLinkData } = {};

  mindmap: MindmapView;

  constructor(mindmap: MindmapView) {
    this.mindmap = mindmap;
  }

  public pushNode(node: GraphNode) {
    log.debug('Pushed node ', node);
    this.nodesMap[node.id] = node;
  }

  public pushLink(link: GraphLinkData) {
    log.debug('Pushed link ', link);
    this.linksMap[link.id] = link;
  }

  getNodeById(id: string): GraphNode {
    return this.nodesMap[id];
  }

  getNodes(): GraphNode[] {
    return Object.values(this.nodesMap);
  }

  getLinks(): GraphLinkData[] {
    return Object.values(this.linksMap);
  }

  /**
   * Returns the link from the given source to given target node id.
   *
   * @param sourceId
   * @param targetId
   */
  getLinkFromNodeIds(sourceId: string, targetId: string): GraphLinkData {
    return this.linksMap[sourceId + '-' + targetId];
  }

  /**
   * Restarts the mindmap simulation.
   */
  markAsDirty() {
    this.mindmap.restartSimulation();
  }
}
