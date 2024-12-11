export = Node;
/**
 * A node within the graph.
 */
declare class Node {
    /**
     * Builds a node object.
     *
     * @param {string|string[]} label - node label(s).
     * @param {Map} properties - properties map.
     */
    constructor(label: string | string[], properties: Map<any, any>);
    id: number;
    label: string | string[];
    properties: Map<any, any>;
    /**
     * Sets the node id.
     * @param {number} id (integer)
     */
    setId(id: number): void;
    /**
     * @returns {string} The string representation of the node.
     */
    toString(): string;
}
