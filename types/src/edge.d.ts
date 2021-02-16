export = Edge;
declare class Edge {
    /**
     * Builds an Edge object.
     * @constructor
     * @param {import('./node')} srcNode - Source node of the edge.
     * @param {string} relation - Relationship type of the edge.
     * @param {import('./node')} destNode - Destination node of the edge.
     * @param {Map} properties - Properties map of the edge.
     */
    constructor(srcNode: import('./node'), relation: string, destNode: import('./node'), properties: Map<any, any>);
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
