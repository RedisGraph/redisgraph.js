const redis = require("redis"),
	util = require("util"),
	ResultSet = require("./resultSet");

/**
 * RedisGraph client
 */
class Graph {
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
		this._graphId = graphId;		// Graph ID
		this._labels = [];            	// List of node labels.
		this._relationshipTypes = []; 	// List of relation types.
		this._properties = [];        	// List of properties.

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
		return this._sendCommand("graph.QUERY", [this._graphId, query, "--compact"]).then(
			res => {
				var resultSet = new ResultSet(this);

				return resultSet.parseResponse(res);
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
			var resultSet = new ResultSet(this);

			return resultSet.parseResponse(res);
		});
	}

	/**
	* Calls procedure
	*
	* @param procedure Procedure to call
	* @param args Arguments to pass
	* @y Yield outputs
	* @return a result set
	*/
	callProcedure(procedure, args = new Array(), y = new Array()) {
		let q = "CALL " + procedure + "(" + args.join(',') + ")" + y.join(' ');
		return this.query(q);
	}

	/**
	 * Retrieves all labels in graph.
	 *
	 * @return array of labels.
	 */
	async labels() {
		var response = await this.callProcedure("db.labels");
		this._labels = this.extractStrings(response);

	}

	/**
	 * Retrieves all relationship types in graph.
	 *
	 * @return array of relationship types.
	 */
	async relationshipTypes() {
		var response = await this.callProcedure("db.relationshipTypes")
		this._relationshipTypes = this.extractStrings(response);
	}

	/**
	 * Retrieves all properties in graph.
	 *
	 * @return array of properties.
	 */
	async propertyKeys() {
		var response = await this.callProcedure("db.propertyKeys");
		this._properties = this.extractStrings(response);
	}

	extractStrings(resultSet) {
		var strings = [];
		while (resultSet.hasNext()) {

			strings.push(resultSet.next().get(0));
		}
		return strings;
	}

	/**
	 * Retrieves label by ID.
	 *
	 * @param id internal ID of label.
	 * @return String label.
	 */
	getLabel(id) {
		return this._labels[id];
	}

	/**
	 * Retrive all the labels from the graph and returns the wanted label
	 * @param id internal ID of label.
	 * @return String label.
	 */
	async fetchAndGetLabel(id) {
		await this.labels();
		return this._labels[id];
	}

	/**
	 * Retrieves relationship type by ID.
	 *
	 * @param id internal ID of relationship type.
	 * @return String relationship type.
	 */
	getRelationship(id) {

		return this._relationshipTypes[id];
	}

	/**
	 * Retrives al the relationshipe types from the graph, and returns the wanted type
	* @param id internal ID of relationship type.
	 * @return String relationship type.
	 */
	async fetchAndGetRelationship(id) {
		await this.relationshipTypes();
		return this._relationshipTypes[id];
	}



	/**
	 * Retrieves property name by ID.
	 *
	 * @param id internal ID of property.
	 * @return String property.
	 */
	getProperty(id) {
		return this._properties[id];

	}

	/**
	 * Retrives al the properties from the graph, and returns the wanted property
	 * @param id internal ID of property.
	 * @return String property.
	 */
	async fetchAndGetProperty(id) {
		await this.propertyKeys();
		return this._properties[id];

	}
}

module.exports = Graph;
