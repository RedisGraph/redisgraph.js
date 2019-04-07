const redis = require("redis"),
	util = require("util"),
	ResultSet = require("./resultSet"),
	assert = require('assert'),
	crypto = require('crypto');
/**
 * Returns a random string
 * This will be used as an alias for a unaliased node/edge
 *  @param length Length of the random string
 */
randomString = function(length=20){
	return "test" + crypto.randomBytes(length/2).toString('hex');
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

		this.nodes = {};
		this.edges = [];
	}
	/**
	 * Add a node to the current graph
	 * 
	 * @param node The node to be added to the graph
	 */
	addNode (node) {

		/**
		 * If alias is null, then alloting it a random alias
		 */
		if (node.getAlias() === null) {
			node.setAlias(randomString());
		}
		this.nodes[node.getAlias()] = node;
	}
	/**
	 * Add an edge to the current graph
	 * 
	 * @param edge The ege to be added to the graph
	 */
	addEdge (edge) {

		// Confirming that both ends of the edge exist
		assert.notEqual(this.nodes[edge.srcNode.alias], null);
		assert.notEqual(this.nodes[edge.destNode.alias], null);

		this.edges.push(edge);
	}

	/**
	 * Execute a Cypher query
	 *
	 * @param query Cypher query
	 * @return a result set
	 */
	query(query) {
		return this._sendCommand("graph.QUERY", [this._graphId, query, "--compact"]).then(
			res => {
				return new ResultSet(res);
			}
		);
	}

	/**
	 * To clear the dictionary of nodes
	 * and the array of edges
	 */
	clear() {
		this.nodes = {};
		this.edges = [];
	}

	/**
	 * To commit the graph
	 * Create the graph with the added nodes and the edges
	 */
	commit() {
		let query = 'CREATE ';

		// Add nodes to the query
		for (let node in this.nodes) {
			query += this.nodes[node].toString() + ',';
		}

		// Add edges to the query
		for (let edge of this.edges ) {
			query += edge.toString() + ',';
		}

		// Removing if there is any dangling coma
		if (query[query.length - 1] === ',') {
			query = query.slice(0, query.length-1);
		}
		this.clear();
		return this.query(query);
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