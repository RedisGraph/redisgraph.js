"use strict";

import { Edge } from "edge";
import { Node } from "node";

export class Path {
    /**
     * @constructor
     * @param {Node[]} nodes - path's node list.
     * @param {Edge[]} edges - path's edge list.
     */
	constructor(public nodes: Node[], public edges: Edge[]) {
		this.nodes = nodes;
		this.edges = edges;
	}

    /**
     * Returns the path's nodes as list.
     * @returns {Node[]} path's nodes.
     */
	get Nodes(): Node[] {
		return this.nodes;
	}

    /**
     * Returns the path's edges as list.
     * @returns {Edge[]} paths' edges.
     */
	get Edges(): Edge[] {
		return this.edges;
    }

    /**
     * Returns a node in a given index.
     * @param {int} index 
     * @returns {Node} node in the given index.
     */
	getNode(index: number) {
		return this.nodes[index];
	}

    /**
     * Returns an edge in a given index.
     * @param {int} index 
     * @returns {Edge} edge in a given index.
     */
	getEdge(index: number) {
		return this.edges[index];
	}

    /**
     * Returns the path's first node.
     * @returns {Node} first node.
     */
	get firstNode(): Node {
		return this.nodes[0];
	}

    /**
     * Returns the last node of the path.
     * @returns {Node} last node.
     */
	get lastNode():Node {
		return this.nodes[this.nodes.length - 1];
	}

    /**
     * Returns the amount of nodes in th path.
     * @returns {int} amount of nodes.
     */
	get nodeCount(): number {
		return this.nodes.length;
	}

    /**
     * Returns the amount of edges in the path.
     * @returns {int} amount of edges.
     */
	get edgeCount(): number {
		return this.edges.length;
	}

    /**
     * Returns the path string representation.
     * @returns {string} path string representation.
     */
	toString(): string {
		return JSON.stringify(this);
	}
}

