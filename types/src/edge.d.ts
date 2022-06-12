export = Edge;
/**
 * @typedef {import('./node')} Node
 */
/**
 * An edge connecting two nodes.
 */
declare class Edge {
    /**
     * Builds an Edge object.
     * @param {Node} srcNode - Source node of the edge.
     * @param {string} relation - Relationship type of the edge.
     * @param {Node} destNode - Destination node of the edge.
     * @param {Map} properties - Properties map of the edge.
     */
    constructor(srcNode: Node, relation: string, destNode: Node, properties: Map<any, any>);
    id: number;
    relation: string;
    srcNode: import("./node");
    destNode: import("./node");
    properties: Map<any, any>;
    /**
     * Sets the edge ID.
     * @param {number} id (integer)
     */
    setId(id: number): void;
    /**
     * @returns The string representation of the edge.
     */
    toString(): string;
}
declare namespace Edge {
    export { Node };
}
type Node = import('./node');
