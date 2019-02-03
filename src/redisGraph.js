const redis = require("redis"),
	util = require("util"),
	ResultSet = require("./resultSet");

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
