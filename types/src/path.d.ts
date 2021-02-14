export = Path;
declare class Path {
    /**
     * @constructor
     * @param {import('./node')[]} nodes - path's node list.
     * @param {import('./edge')[]} edges - path's edge list.
     */
    constructor(nodes: import('./node')[], edges: import('./edge')[]);
    nodes: import("./node")[];
    edges: import("./edge")[];
    /**
     * Returns the path's nodes as list.
     * @returns {import('./node')[]} path's nodes.
     */
    get Nodes(): import("./node")[];
    /**
     * Returns the path's edges as list.
     * @returns {import('./edge')[]} paths' edges.
     */
    get Edges(): import("./edge")[];
    /**
     * Returns a node in a given index.
     * @param {number} index (integer)
     * @returns {import('./node')} node in the given index.
     */
    getNode(index: number): import('./node');
    /**
     * Returns an edge in a given index.
     * @param {number} index (integer)
     * @returns {import('./edge')} edge in a given index.
     */
    getEdge(index: number): import('./edge');
    /**
     * Returns the path's first node.
     * @returns {import('./node')} first node.
     */
    get firstNode(): import("./node");
    /**
     * Returns the last node of the path.
     * @returns {import('./node')} last node.
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
