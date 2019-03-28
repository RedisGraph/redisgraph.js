const redis = require("redis"),
	util = require("util"),
	ResultSet = require("./resultSet"),
	assert = require('assert');

/**
 * RedisGraph Node
 */
class Node {

	/**
	 * Creates a node with provided alias, label and properties
	 * 
	 * @param nodeId The id to identify the node uniquely
	 * @param alias The alias that we wish to give to the node
	 * @param label The label associated with the node
	 * @param properties The properties of the node
	 */
	constructor (nodeId = null, alias = null, label = null, properties = null) {
	  this.id = nodeId;
	  this.alias = alias;
	  this.label = label;
	  this.properties = properties;
	}
	
	/**
	 * To set alias for the node
	 * 
	 *  @param alias The alias to be set for the node.
	 */
	setAlias (alias) {
		this.alias = alias;
	}

	/**
	 * To get the value of the alias set for the node
	 * 
	 * @return the alias of the node
	 */
	getAlias () {
		return this.alias;
	}
  
	  /**
	   * TO get the node in a string format.
	   * So that it can be added to the graph query
	   * 
	   * @return Node details in a string
	   */
	toString () {
		  let nodeString = '(';
	  
		  // Adding the alias to the node string
		  nodeString += (this.alias || '');
	  
		  // Adding the label to the node string
		if (this.label !== null) {
			nodeString += ':' + this.label;
		}
		
		if (this.properties && this.properties !== {}){
		// Formating properties to add to the string
		let properties = JSON.stringify(this.properties);

		// Removing the double quotes around the keys
		properties = properties.replace(/\"(\w*)\":/g, "$1:");

		// Adding the properties to the node string
		// Giving the space = 2 by default
		nodeString += ' ' + properties;
		}

		nodeString += ')';
	
		return nodeString;
	}
}

/**
 * RedisGraph Edge
 */
class Edge {
	/**
	 * Creates edge with provided source node, relation, destination node
	 * and properties
	 * @param srcNode The source node of the edge 
	 * @param relation The relation between the source node and the destination node
	 * @param destNode The destination node of the edge
	 * @param properties The properties of the relation/edge
	 */
    constructor (srcNode, relation, destNode, properties = null) {

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
            edgeString += ': ' + this.relation;
        }

        if ( this.properties != null || this.properties != {}) {
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

/**
 * RedisGraph client
 */
class RedisGraph {
	/**
	 * Creates a client to a specific graph running on the specific host/post
	 * See: node_redis for more options on createClient
	 *
	 * @param graphId the graph id
	 * @param host Redis host or node_redis client
	 * @param port Redis port
	 * @param options node_redis options
	 */
	constructor(graphId, host, port, options) {
		this._graphId = graphId;
		let client =
			host instanceof redis.RedisClient
				? host
				: redis.createClient.apply(redis, [].slice.call(arguments, 1));
		this._sendCommand = util.promisify(client.send_command).bind(client);
	}

	/**
	 * Execute a Cypher query
	 *
	 * @param query Cypher query
	 * @return a result set
	 */
	query(query) {
		return this._sendCommand("graph.QUERY", [this._graphId, query]).then(
			res => {
				return new ResultSet(res);
			}
		);
	}

	/**
	 * Deletes the entire graph
	 *
	 * @return delete running time statistics
	 */
	deleteGraph() {
		return this._sendCommand("graph.DELETE", [this._graphId]).then(res => {
			return new ResultSet(res);
		});
	}
}

module.exports = RedisGraph;
