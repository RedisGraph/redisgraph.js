"use strict";
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
		this._graphId = graphId;        // Graph ID
		this._labels = [];              // List of node labels.
		this._relationshipTypes = [];   // List of relation types.
		this._properties = [];          // List of properties.

		this._labelsPromise = undefined;        // used as a synchronization mechanizom for labels retrival
		this._propertyPromise = undefined;      // used as a synchronization mechanizom for property names retrival
		this._relationshipPromise = undefined;  // used as a synchronization mechanizom for relationship types retrival

		let client =
			host instanceof redis.RedisClient
				? host
				: redis.createClient.apply(redis, [].slice.call(arguments, 1));
		this._sendCommand = util.promisify(client.send_command).bind(client);
	}

	/**
	 * auxilary function to extract string(s) data from procedures such as:
	 * db.labels, db.propertyKeys and db.relationshipTypes
	 * @param  resultSet - a procedure result set
	 */
	_extractStrings(resultSet) {
		var strings = [];
		while (resultSet.hasNext()) {
			strings.push(resultSet.next().getString(0));
		}
		return strings;
	}

	paramToString(paramValue) {
		if (paramValue == null) return "null";
		let paramType = typeof paramValue;
		if (paramType == "string") {
			let strValue = "";
			if (paramValue[0] != '"') strValue += '"';
			strValue += paramValue;
			if (paramValue[paramValue.length - 1] != '"') strValue += '"';
			return strValue;
		}
		if (Array.isArray(paramValue)) {
			let stringsArr = new Array(paramValue.length);
			for (var i = 0; i < paramValue.length; i++) {
				stringsArr[i] = this.paramToString(paramValue[i]);
			}
			return ["[", stringsArr.join(", "), "]"].join("");
		}
		return paramValue;
	}

	/**
	 * Extracts parameters from dictionary into cypher parameters string.
	 *
	 * @param params parameters dictionary.
	 * @return a cypher parameters string.
	 */
	buildParamsHeader(params) {
		let paramsArray = ["CYPHER"];

		for (var key in params) {
			let value = this.paramToString(params[key]);
			paramsArray.push(`${key}=${value}`);
		}
		paramsArray.push(" ");
		return paramsArray.join(" ");
	}

	/**
	 * Execute a Cypher query (async)
	 *
	 * @param query Cypher query
	 * @param params Parameters map
	 * @return a promise contains a result set
	 */
	async query(query, params) {
		if (params) {
			query = this.buildParamsHeader(params) + query;
		}
		var res = await this._sendCommand("graph.QUERY", [
			this._graphId,
			query,
			"--compact"
		]);
		var resultSet = new ResultSet(this);
		return resultSet.parseResponse(res);
	}

	/**
	 * Deletes the entire graph (async)
	 *
	 * @return a promise contains the delete operation running time statistics
	 */
	async deleteGraph() {
		var res = await this._sendCommand("graph.DELETE", [this._graphId]);
		//clear internal graph state
		this._labels = [];
		this._relationshipTypes = [];
		this._properties = [];
		var resultSet = new ResultSet(this);
		return resultSet.parseResponse(res);
	}

	/**
	 * Calls procedure
	 *
	 * @param procedure Procedure to call
	 * @param args Arguments to pass
	 * @param y Yield outputs
	 * @return a promise contains the procedure result set data
	 */
	callProcedure(procedure, args = new Array(), y = new Array()) {
		let q = "CALL " + procedure + "(" + args.join(",") + ")" + y.join(" ");
		return this.query(q);
	}

	/**
	 * Retrieves all labels in graph.
	 */
	async labels() {
		if (this._labelsPromise == undefined) {
			this._labelsPromise = this.callProcedure("db.labels").then(
				response => {
					return this._extractStrings(response);
				}
			);
			this._labels = await this._labelsPromise;
			this._labelsPromise = undefined;
		} else {
			await this._labelsPromise;
		}
	}

	/**
	 * Retrieves all relationship types in graph.
	 */
	async relationshipTypes() {
		if (this._relationshipPromise == undefined) {
			this._relationshipPromise = this.callProcedure(
				"db.relationshipTypes"
			).then(response => {
				return this._extractStrings(response);
			});
			this._relationshipTypes = await this._relationshipPromise;
			this._relationshipPromise = undefined;
		} else {
			await this._relationshipPromise;
		}
	}

	/**
	 * Retrieves all properties in graph.
	 */
	async propertyKeys() {
		if (this._propertyPromise == undefined) {
			this._propertyPromise = this.callProcedure("db.propertyKeys").then(
				response => {
					return this._extractStrings(response);
				}
			);
			this._properties = await this._propertyPromise;
			this._propertyPromise = undefined;
		} else {
			await this._propertyPromise;
		}
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
