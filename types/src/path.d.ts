export = Path;
/**
 * @typedef {import('./node')} Node
 */
/**
 * @typedef {import('./edge')} Edge
 */
declare class Path {
    /**
     * @param {Node[]} nodes - path's node list.
     * @param {Edge[]} edges - path's edge list.
     */
    constructor(nodes: Node[], edges: Edge[]);
    nodes: import("./node")[];
    edges: import("./edge")[];
    /**
     * Returns the path's nodes as list.
     * @returns {Node[]} path's nodes.
     */
    get Nodes(): import("./node")[];
    /**
     * Returns the path's edges as list.
     * @returns {Edge[]} paths' edges.
     */
    get Edges(): import("./edge")[];
    /**
     * Returns a node in a given index.
     * @param {number} index (integer)
     * @returns {Node} node in the given index.
     */
    getNode(index: number): Node;
    /**
     * Returns an edge in a given index.
     * @param {number} index (integer)
     * @returns {Edge} edge in a given index.
     */
    getEdge(index: number): Edge;
    /**
     * Returns the path's first node.
     * @returns {Node} first node.
     */
    get firstNode(): import("./node");
    /**
     * Returns the last node of the path.
     * @returns {Node} last node.
     */
    get lastNode(): import("./node");
    /**
     * Returns the amount of nodes in th path.
     * @returns {number} amount of nodes. (integer)
     */
    get nodeCount(): number;
    /**
     * Returns the amount of edges in the path.
     * @returns {number} amount of edges. (integer)
     */
    get edgeCount(): number;
    /**
     * Returns the path string representation.
     * @returns {string} path string representation.
     */
    toString(): string;
}
declare namespace Path {
    export { Node, Edge };
}
type Node = import("./node");
type Edge = import("./edge");
