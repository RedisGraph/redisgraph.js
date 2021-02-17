"use strict";

/**
 * @typedef {import('./node')} Node
 */

/**
 * @typedef {import('./edge')} Edge
 */

class Path {
    /**
     * @param {Node[]} nodes - path's node list.
     * @param {Edge[]} edges - path's edge list.
     */
	constructor(nodes, edges) {
		this.nodes = nodes;
		this.edges = edges;
	}

    /**
     * Returns the path's nodes as list.
     * @returns {Node[]} path's nodes.
     */
	get Nodes() {
		return this.nodes;
	}

    /**
     * Returns the path's edges as list.
     * @returns {Edge[]} paths' edges.
     */
	get Edges() {
		return this.edges;
    }

    /**
     * Returns a node in a given index.
     * @param {number} index (integer)
     * @returns {Node} node in the given index.
     */
	getNode(index) {
		return this.nodes[index];
	}

    /**
     * Returns an edge in a given index.
     * @param {number} index (integer)
     * @returns {Edge} edge in a given index.
     */
	getEdge(index) {
		return this.edges[index];
	}

    /**
     * Returns the path's first node.
     * @returns {Node} first node.
     */
	get firstNode() {
		return this.nodes[0];
	}

    /**
     * Returns the last node of the path.
     * @returns {Node} last node.
     */
	get lastNode() {
		return this.nodes[this.nodes.length - 1];
	}

    /**
     * Returns the amount of nodes in th path.
     * @returns {number} amount of nodes. (integer)
     */
	get nodeCount() {
		return this.nodes.length;
	}

    /**
     * Returns the amount of edges in the path.
     * @returns {number} amount of edges. (integer)
     */
	get edgeCount() {
		return this.edges.length;
	}

    /**
     * Returns the path string representation.
     * @returns {string} path string representation.
     */
	toString() {
		return JSON.stringify(this);
	}
}

module.exports = Path;
