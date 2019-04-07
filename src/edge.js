/**
 * An edge connecting two nodes.
 */
class Edge {
	/**
	 * Creates edge with provided source node, relation, destination node
	 * and properties
	 * @param srcNode The source node of the edge 
	 * @param relation The relation between the source node and the destination node
	 * @param destNode The destination node of the edge
     * @param edgeId The unique identity to identify the current edge
	 * @param properties The properties of the relation/edge
	 */
    constructor (srcNode, relation, destNode, edgeId = null, properties = null) {

		/**
		 * The source node cannot be null and has to be of Node Type
		 * Similaryly, the destination node cannot be null and has to be Edge Type
		 */
        assert.notEqual(srcNode, null);
        assert.equal(srcNode instanceof Node, true);
        assert.notEqual(destNode, null);
        assert.equal(destNode instanceof Node, true);
        this.srcNode = srcNode;
        this.relation = relation;
        this.destNode = destNode;
        this.id = edgeId;
        this.properties = properties;
    }

	/**
	   * TO get the edge in a string format.
	   * So that it can be added to the graph query
	   * 
	   * @return Edge details in a string
	   */
    toString () {

		// The source node (sourceNodeAlias)
				let edgeString = '(' + this.srcNode.getAlias() + ')';

		// The relation (sourceNodeAlias)-[:relation]
				edgeString += '-[';
				
        if ( this.relation !== null) {
            edgeString += ':' + this.relation;
				}

				
        if ( this.properties && this.properties !== {}) {
            // Formating properties to add to the string
						let properties = JSON.stringify(this.properties);
				
						// Removing the double quotes around the keys
						properties = properties.replace(/\"(\w*)\":/g, "$1:");
						
						edgeString = ' ' + properties;
				}
				
        edgeString += ']->';

		// The destination node (sourceNodeAlias)-[:relation]->(destinationNodeAlias)
        edgeString += '(' + this.destNode.getAlias() + ')';

        return edgeString;
    }
}

module.exports = Edge;
