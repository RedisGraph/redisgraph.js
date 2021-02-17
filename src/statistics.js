"use strict";

const Label = require("./label");

class Statistics {
    /**
     * Builds a query statistics object out of raw data.
     * @constructor
     * @param {object[]} raw - raw data.
     */
	constructor(raw) {
		this._raw = raw;
	}

    /**
     * Returns a statistics value according to the statistics label.
     * @param {import('./label')} label - Statistics label.
     */
	getStringValue(label) {
		return this.getStatistics()[label];
	}

	/**
	 * Return the query statistics
	 * @return {Object<string, string>} statistics object
	 */
	getStatistics() {
		if (!this._statistics) {
			this._statistics = {};
			for (let row of this._raw) {
				let touple = row.split(":");
				this._statistics[touple[0]] = touple[1].trim();
			}
		}
		return this._statistics;
	}

    /**
     * Returns the integer value of a requested label.
     * @param {import('./label')} label
     * @returns {number} The actual value if exists, 0 otherwise. (integer)
     */
	getIntValue(label) {
		let value = this.getStringValue(label);
		return value ? parseInt(value) : 0;
	}

     /**
     * Returns the float value of a requested label.
     * @param {import('./label')} label
     * @returns {number} The actual value if exists, 0 otherwise.
     */
	getFloatValue(label) {
		let value = this.getStringValue(label);
		return value ? parseFloat(value) : 0;
	}

    /**
     * @returns {number} The amount of nodes created by th query. (integer)
     */
	nodesCreated() {
		return this.getIntValue(Label.NODES_CREATED);
	}

    /**
     * @returns {number} The amount of nodes deleted by the query. (integer)
     */
	nodesDeleted() {
		return this.getIntValue(Label.NODES_DELETED);
	}

    /**
     * @returns {number} The amount of labels created by the query. (integer)
     */
	labelsAdded() {
		return this.getIntValue(Label.LABELS_ADDED);
	}

    /**
     * @returns {number} The amount of relationships deleted by the query. (integer)
     */
	relationshipsDeleted() {
		return this.getIntValue(Label.RELATIONSHIPS_DELETED);
	}

    /**
     * @returns {number} The amount of relationships created by the query. (integer)
     */
	relationshipsCreated() {
		return this.getIntValue(Label.RELATIONSHIPS_CREATED);
	}

    /**
     * @returns {number} The amount of properties set by the query. (integer)
     */
	propertiesSet() {
		return this.getIntValue(Label.PROPERTIES_SET);
	}

    /**
     * @returns {number} The amount of indices created by the query. (integer)
     */
	indicesCreated() {
		return this.getIntValue(Label.INDICES_CREATED);
	}

    /**
     * @returns {number} The amount of indices deleted by the query. (integer)
     */
	indicesDeleted() {
		return this.getIntValue(Label.INDICES_DELETED);
    }

    /**
     * @returns {boolean} The execution plan was cached on RedisGraph.
     */
    cachedExecution() {
        return  this.getIntValue(Label.CACHED_EXECUTION) == 1;
    }

    /**
     * @returns {number} The query execution time in ms.
     */
	queryExecutionTime() {
		return this.getFloatValue(Label.QUERY_INTERNAL_EXECUTION_TIME);
	}
}

module.exports = Statistics;
