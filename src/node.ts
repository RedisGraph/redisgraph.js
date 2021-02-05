"use strict";
/**
 * A node within the garph.
 */
export class Node {

    private id?: number;
    /**
     * Builds a node object.
     * @constructor
     * @param {string} label - node label.
     * @param {Map} properties - properties map.
     */
	constructor(public label: string, public properties: Map<string, any>) {
		this.id = undefined;            //node's id - set by RedisGraph
		this.label = label;             //node's label
		this.properties = properties;   //node's list of properties (list of Key:Value)
	}

    /**
     * Sets the node id.
     * @param {int} id 
     */
	setId(id: number) {
		this.id = id;
	}

    /**
     * @returns {string} The string representation of the node.
     */
	toString(): string {
		return JSON.stringify(this);
	}
}

