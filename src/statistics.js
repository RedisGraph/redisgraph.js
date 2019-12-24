"use strict";
const Label = require("./label");

class Statistics {
    /**
     * Builds a query statistics object out of raw data.
     * @constructor
     * @param {*} raw - raw data.
     */
	constructor(raw) {
		this._raw = raw;
	}

    /**
     * Returns a statistics value according to the statistics label.
     * @param {Label} label - Statistics label.
     */
	getStringValue(label) {
		return this.getStatistics()[label];
	}

	/**
	 * Return the query statistics
	 * @return statistics object
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
     * @param {Label} label 
     * @returns The actual value if exists, 0 otherwise.
     */
	getIntValue(label) {
		let value = this.getStringValue(label);
		return value ? parseInt(value) : 0;
	}

     /**
     * Returns the float value of a requested label.
     * @param {Label} label 
     * @returns The actual value if exists, 0 otherwise.
     */
	getFloatValue(label) {
		let value = this.getStringValue(label);
		return value ? parseFloat(value) : 0;
	}

    /**
     * @returns The amount of nodes created by th query.
     */
	nodesCreated() {
		return this.getIntValue(Label.NODES_CREATED);
	}

    /**
     * @returns The amount of nodes deleted by the query.
     */
	nodesDeleted() {
		return this.getIntValue(Label.NODES_DELETED);
	}

    /**
     * @returns The amount of labels created by the query.
     */
	labelsAdded() {
		return this.getIntValue(Label.LABELS_ADDED);
	}

    /**
     * @returns The amount of relationships deleted by the query.
     */
	relationshipsDeleted() {
		return this.getIntValue(Label.RELATIONSHIPS_DELETED);
	}

    /**
     * @returns The amount of relationships created by the query.
     */
	relationshipsCreated() {
		return this.getIntValue(Label.RELATIONSHIPS_CREATED);
	}

    /**
     * @returns The amount of properties set by the query.
     */
	propertiesSet() {
		return this.getIntValue(Label.PROPERTIES_SET);
	}

    /**
     * @returns The amount of indices created by the query.
     */
	indicesCreated() {
		return this.getIntValue(Label.INDICES_CREATED);
	}

    /**
     * @returns The amount of indices deleted by the query.
     */
	indicesDeleted() {
		return this.getIntValue(Label.INDICES_DELETED);
	}

    /**
     * @returns The query execution time in ms.
     */
	queryExecutionTime() {
		return this.getFloatValue(Label.QUERY_INTERNAL_EXECUTION_TIME);
	}
}

module.exports = Statistics;
