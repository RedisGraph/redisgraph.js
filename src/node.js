"use strict";
/**
 * A node within the garph.
 */
class Node {
    /**
     * Builds a node object.
     * @constructor
     * @param {string} label - node label.
     * @param {Map} properties - properties map.
     */
	constructor(label, properties) {
		this.id = undefined;            //node's id - set by RedisGraph
		this.label = label;             //node's label
		this.properties = properties;   //node's list of properties (list of Key:Value)
	}

    /**
     * Sets the node id.
     * @param {int} id 
     */
	setId(id) {
		this.id = id;
	}

    /**
     * @returns {string} The string representation of the node.
     */
	toString() {
		return JSON.stringify(this);
	}
}

module.exports = Node;
