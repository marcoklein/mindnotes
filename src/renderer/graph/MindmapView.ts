import * as d3 from 'd3';
import { GraphNode } from './GraphNode';
import { GraphLinkData } from './GraphLink';
import { GraphData } from './GraphData';

type D3NodeType = d3.Selection<any, GraphNode, SVGGElement, unknown>;
type D3LinkType = d3.Selection<SVGLineElement, GraphLinkData, SVGGElement, unknown>;

/**
 * Controller for the visual mindmap representation.
 * Uses the D3.js framework for rendering.
 */
export class MindmapView {
    private node: D3NodeType | undefined;
    private link: D3LinkType | undefined;

    /**
     * Graphics within SVG for rendering.
     */
    private container: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

    private readonly graphData: GraphData;

    private simulation: d3.Simulation<GraphNode, GraphLinkData>;

    constructor() {
        // setup svg
        let width = 400;
        let height = 400;
        let svg = d3.select('#renderContainer')
            .attr('width', width)
            .attr('height', height);
        svg.style('background-color', 'lightblue');
        this.container = svg.append('g');

        // base graph data
        this.graphData = new GraphData(this);

        // create simulation
        this.simulation = this.createGraphLayout(this.graphData, width, height);

        // render links and nodes
        this.link = this.container.append('g').selectAll('link');
        this.node = this.container.append('g').selectAll('node');

        // enable zooming
        svg.call(
            <any> d3.zoom()
                .scaleExtent([.1, 4])
                .on('zoom', () => this.container.attr('transform', d3.event.transform))
        );

        this.renderNodes();
        this.renderLinks();
    }

    /**
     * Creates a new node and adds it to the internal graph data.
     * 
     * @param id 
     * @param text 
     * @returns The created node.
     */
    public addNewNode(id: string, text: string): GraphNode {
        const node = new GraphNode(this.graphData, id, text);
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

    private createGraphLayout(graphData: GraphData, width: number, height: number) {
        return d3.forceSimulation(graphData.getNodes())
            .force('charge', d3.forceManyBody().strength(-3000))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('x', d3.forceX(width / 2).strength(1))
            .force('y', d3.forceY(height / 2).strength(1))
            .force('link', d3.forceLink(graphData.getLinks()).id((d) => (<GraphNode> d).id).distance(100).strength(1))
            .on('tick', this.ticked);
    }

    public renderLinks() {
        if (!this.link) {
            return;
        }

        this.link = this.link.data(this.graphData.getLinks(), l => l.id);
        this.link.exit().remove();
        this.link = this.link.enter()
            .append('line')
                .attr('stroke', '#000')
                .attr('stroke-width', 1.5)
            .merge(this.link);
    }

    public renderNodes() {
        if (!this.node) {
            return;
        }

        this.node = this.node.data(this.graphData.getNodes(), n => n.id);

        this.node.exit().remove();
        const nodeGraphics = this.node.enter().append('g');
        nodeGraphics
            .append('ellipse')
                .attr('rx', 40)
                .attr('ry', 20)
                .attr('fill', '#888');
        nodeGraphics
            .append('text')
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'central')
                .text(n => n.getText());
        this.node = this.node
            .merge(nodeGraphics);
            
        // ensure updated text
        const texts: D3NodeType = this.node.selectAll('text');
        texts.text(n => n.getText());
    }

    /**
     * Restarts the simulation after the GraphData has been modified.
     */
    public restartSimulation() {
        this.simulation.nodes(this.graphData.getNodes());
        (<d3.ForceLink<d3.SimulationNodeDatum, GraphLinkData>> this.simulation.force('link')).links(this.graphData.getLinks());
        this.simulation.alpha(0.3).restart();
    }
        
    private ticked = () => {
        this.node?.call(this.updateNode);
        this.link?.call(this.updateLink);
    };

    private updateNode = (node: D3NodeType) => {
        node.attr("transform", (d) => {
            return "translate(" + this.fixna(d.x) + "," +  this.fixna(d.y) + ")";
        });
    };

    private updateLink = (link: D3LinkType) => {
        link.attr('x1', d => this.fixna(d.source.x))
            .attr('y1', d => this.fixna(d.source.y))
            .attr('x2', d => this.fixna(d.target.x))
            .attr('y2', d => this.fixna(d.target.y));
    };

    private fixna(x: number | undefined) {
        if (x !== undefined && isFinite(x)) {
            return x;
        }
        return 0;
    }

}
