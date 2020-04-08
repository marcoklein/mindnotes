import { GraphLinkData } from "./GraphLink";
import { GraphData } from "./GraphData";

/**
 * The visual representation of a node within a graph.
 * <p>
 * A node handles node events and updates internal data by itself.
 * It is only controlled through external NodeEvents.
 */
export class GraphNode implements d3.SimulationNodeDatum {
    readonly graphData: GraphData;
    
    /**
     * Unique identifier of this node.
     */
    readonly id: string;
    /**
     * Id of parent node. May be undefined if its a root node.
     */
    private _parentId: string | undefined;
    /**
     * A Node may contain several text lines.
     * The rendered text is always a concatenation of them.
     */
    readonly textLines: string[] = [];
    x: number;
    y: number;

    /**
     * Creates a new graph node instance.
     * 
     * @param id Unique identifier for this GraphNode.
     * @param headText First line of text.
     */
    constructor(graphData: GraphData, id: string, headText: string) {
        this.graphData = graphData;
        this.id = id;
        this.textLines = [headText];
        this.x = 0;
        this.y = 0;
    }

    /**
     * Returns the text content of this node.
     * This is a concatenation of all textLines with a newline separator.
     */
    getText() {
        return this.textLines.join('\n');
    }

    /**
     * Changes the parent to the GraphNode with the given parentId.
     * Links are inserted or updated accordingly.
     * 
     * @param parentId 
     * @returns This GraphNode.
     */
    changeParent(parentId: string | undefined): GraphNode {
        if (this._parentId === parentId) {
            return this;
        }
        // remove existing parent link
        if (this._parentId) {
            this.graphData.getLinkFromNodeIds(this.id, this._parentId).remove();
        }
        // link to new parent
        const parent = this.graphData.mindmap.getNode(parentId);
        if (parent) {
            const link = new GraphLinkData(this.graphData, this, parent);
            this._parentId = parentId;
            this.graphData.pushLink(link);
            this.graphData.mindmap.renderLinks();
            this.graphData.markAsDirty();
        }
        return this;
    }

    /**
     * Changes the given text line.
     * 
     * @param text 
     */
    changeText(text: string, line: number) {
        this.textLines[line] = text;
        this.graphData.mindmap.renderNodes();
        this.graphData.markAsDirty();
    }

    /**
     * Removes itself and all related links from the GraphData and from the Mindmap.
     */
    remove() {
        console.log('Removing node with id ' + this.id);
        
        if (this._parentId) {
            this.graphData.getLinkFromNodeIds(this.id, this._parentId).remove();
        }

        // TODO reassign possible child nodes to new node
        delete this.graphData.nodesMap[this.id];
        this.graphData.mindmap.renderNodes();
        this.graphData.markAsDirty();
        
    }
}