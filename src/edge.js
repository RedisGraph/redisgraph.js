"use strict";
/**
 * An edge connecting two nodes.
 */
class Edge {
	constructor(srcNode, relation, destNode, properties) {
		this.id = undefined;            //edge's id - set by RedisGraph
		this.relation = relation;       //edge's relationship type
		this.srcNode = srcNode;         //edge's source node
		this.destNode = destNode;       //edge's destinatio node
		this.properties = properties;   //edge's list of properties (list of Key:Value)
	}

	setId(id) {
		this.id = id;
	}
	toString() {
		return JSON.stringify(this);
	}
}

module.exports = Edge;
