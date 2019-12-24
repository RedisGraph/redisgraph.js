"use strict";
class Path {
    /**
     * @constructor
     * @param {List} nodes - path's node list.
     * @param {List} edges - path's edge list.
     */
	constructor(nodes, edges) {
		this.nodes = nodes;
		this.edges = edges;
	}

    /**
     * Returns the path's nodes as list.
     */
	get Nodes() {
		return this.nodes;
	}

    /**
     * Returns the path's edges as list.
     */
	get Edges() {
		return this.edges;
    }

    /**
     * Returns a node in a given index.
     * @param {int} index 
     */
	getNode(index) {
		return this.nodes[index];
	}

    /**
     * Returns an edge in a given index.
     * @param {int} index 
     */
	getEdge(index) {
		return this.edges[index];
	}

    /**
     * Returns the path's first node.
     */
	get firstNode() {
		return this.nodes[0];
	}

    /**
     * Returns the last node of the path.
     */
	get lastNode() {
		return this.nodes[this.nodes.length - 1];
	}

    /**
     * Returns the amount of nodes in th path.
     */
	get nodeCount() {
		return this.nodes.length;
	}

    /**
     * Returns the amount of edges in the path.
     */
	get edgeCount() {
		return this.edges.length;
	}

	toString() {
		return JSON.stringify(this);
	}
}

module.exports = Path;
