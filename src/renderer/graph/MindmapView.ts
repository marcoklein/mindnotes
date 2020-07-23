import * as d3 from 'd3';
import { GraphNode } from './GraphNode';
import { GraphLinkData } from './GraphLink';
import { GraphData } from './GraphData';
import { rendererLogger } from '../../logger';
import { BrowserUtils } from './BrowserUtils';
const log = rendererLogger('mindmap-view');

type D3NodeType = d3.Selection<any, GraphNode, SVGGElement, unknown>;
type D3LinkType = d3.Selection<SVGLineElement, GraphLinkData, SVGGElement, unknown>;

/**
 * Controller for the visual mindmap representation.
 * Uses the D3.js framework for rendering.
 */
export class MindmapView {
  private node: D3NodeType | undefined;
  private link: D3LinkType | undefined;

  private lastSpawnX = -1;

  /**
   * Graphics within SVG for rendering.
   */
  private g: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

  private readonly graphData: GraphData;

  private simulation: d3.Simulation<GraphNode, GraphLinkData>;

  constructor() {
    // setup svg
    // TODO get sizes of svg element - resize dynamically
    let width = 400;
    let height = 400;
    let svg = d3.select('svg').attr('width', width).attr('height', height);
    svg.style('background-color', 'lightblue');
    this.g = svg.append('g');

    // base graph data
    this.graphData = new GraphData(this);
    // create simulation
    this.simulation = this.createGraphLayout(this.graphData, width, height);
    this.link = this.g.append('g').selectAll('link');
    this.node = this.g.append('g').selectAll('node');

    // enable zoom
    svg.call(
      <any>d3
        .zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', () => this.g.attr('transform', d3.event.transform))
    );

    // render initial data and start simulation
    this.renderNodes();
    this.renderLinks();
    this.restartSimulation();
  }

  /**
   * Creates a new node and adds it to the internal graph data.
   *
   * @param id
   * @param text
   * @returns The created node.
   */
  public addNewNode(id: string, text: string): GraphNode {
    this.lastSpawnX++;
    const node = new GraphNode(this.graphData, id, text, this.lastSpawnX, 0);
    this.graphData.pushNode(node);
    this.renderNodes();
    this.restartSimulation();
    return node;
  }

  /**
   * Get node with given id.
   *
   * @param id
   */
  public getNode(id: string | undefined): GraphNode | undefined {
    if (!id) {
      return undefined;
    }
    return this.graphData.nodesMap[id];
  }

  /**
   * Creates the graph physics.
   *
   * @param graphData
   * @param width
   * @param height
   */
  private createGraphLayout(graphData: GraphData, width: number, height: number) {
    return d3
      .forceSimulation(graphData.getNodes())
      .force('charge', d3.forceManyBody().strength(-3000))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(1))
      .force('y', d3.forceY(height / 2).strength(1))
      .force(
        'link',
        d3
          .forceLink(graphData.getLinks())
          .id((d) => (<GraphNode>d).id)
          .distance(100)
          .strength(1)
      )
      .on('tick', this.ticked);
  }

  public renderLinks() {
    if (!this.link) {
      return;
    }

    this.link = this.link.data(this.graphData.getLinks(), (l) => l.id);
    this.link.exit().remove();
    this.link = this.link.enter().append('line').attr('stroke', '#000').attr('stroke-width', 1.5).merge(this.link);
  }

  public renderNodes() {
    if (!this.node) {
      return;
    }

    this.node = this.node.data(this.graphData.getNodes(), (n) => n.id);
    this.node.exit().remove();

    const nodeGraphics = this.node.enter().append('g');
    nodeGraphics.attr('x', () => Math.random() * 5000);

    nodeGraphics.call(
      <any>(
        d3
          .drag()
          .subject(this.dragsubject)
          .on('start', this.dragstarted)
          .on('drag', this.dragged)
          .on('end', this.dragended)
      )
    );
    nodeGraphics.append('rect');
    nodeGraphics
      .append('text')
      .attr('font-size', '14px')
      .attr('font-family', 'sans-serif')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'central')
      .attr('fill', 'black')
      .text((n) => n.getText());
    this.node = this.node.merge(nodeGraphics);

    // TODO wrap labels and use node().getComputedTextLength() - https://bl.ocks.org/mbostock/7555321
    const nodeRect: D3NodeType = this.node.selectAll('rect');
    nodeRect
      .attr('width', (n) => BrowserUtils.calculateTextWidth(n.getText(), 14, 'sans-serif') + 10)
      .attr('x', (n) => -BrowserUtils.calculateTextWidth(n.getText(), 14) / 2 - 5)
      .attr('height', 30)
      .attr('y', -19)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', '#888');

    // ensure text updates
    const texts: D3NodeType = this.node.selectAll('text');
    texts.text((n) => n.getText());
  }

  /**
   * Restarts the simulation after the GraphData has been modified.
   */
  public restartSimulation() {
    this.simulation.nodes(this.graphData.getNodes());
    (<d3.ForceLink<d3.SimulationNodeDatum, GraphLinkData>>this.simulation.force('link')).links(
      this.graphData.getLinks()
    );
    this.simulation.alpha(0.3).restart();
  }

  private ticked = () => {
    this.node?.call(this.updateNode);
    this.link?.call(this.updateLink);
  };

  private updateNode = (node: D3NodeType) => {
    node.attr('transform', (d) => {
      return 'translate(' + this.fixna(d.x) + ',' + this.fixna(d.y) + ')';
    });
  };

  private updateLink = (link: D3LinkType) => {
    link
      .attr('x1', (d) => this.fixna(d.source.x))
      .attr('y1', (d) => this.fixna(d.source.y))
      .attr('x2', (d) => this.fixna(d.target.x))
      .attr('y2', (d) => this.fixna(d.target.y));
  };

  private fixna(x: number | undefined) {
    if (x !== undefined && isFinite(x)) {
      return x;
    }
    return 0;
  }

  /* Dragging Callbacks */

  /**
   * Returns the dragged node.
   */
  private dragsubject = (d: any) => {
    return d;
  };

  private dragstarted = () => {
    if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;
  };

  private dragged = () => {
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
  };

  private dragended = () => {
    if (!d3.event.active) this.simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
  };
}
