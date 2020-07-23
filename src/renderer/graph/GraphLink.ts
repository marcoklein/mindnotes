import { GraphNode } from './GraphNode';
import { GraphData } from './GraphData';

/**
 * Data of a link that connects two graph nodes.
 */
export class GraphLinkData implements d3.SimulationLinkDatum<GraphNode> {
  readonly graphData: GraphData;
  readonly id: string;
  readonly source: GraphNode;
  readonly target: GraphNode;

  constructor(graphData: GraphData, source: GraphNode, target: GraphNode) {
    this.graphData = graphData;
    this.source = source;
    this.target = target;
    this.id = this.source.id + '-' + this.target.id;
  }

  /**
   * Removes itself from the graph.
   */
  remove() {
    delete this.graphData.linksMap[this.id];
    this.graphData.mindmap.renderLinks();
    this.graphData.markAsDirty();
  }
}
