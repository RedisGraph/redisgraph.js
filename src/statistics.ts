"use strict";

import { Label } from "./label";


export class Statistics {
    /**
     * Builds a query statistics object out of raw data.
     * @constructor
     * @param {object[]} raw - raw data.
     */
	constructor(private _raw: any[]) {
	}
	
	private _statistics: any;

    /**
     * Returns a statistics value according to the statistics label.
     * @param {Label} label - Statistics label.
     */
	getStringValue(label: string) {
		return this.getStatistics()[label];
	}

	/**
	 * Return the query statistics
	 * @return {Statistics} statistics object
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
     * @returns {int} The actual value if exists, 0 otherwise.
     */
	getIntValue(label: string): number {
		let value = this.getStringValue(label);
		return value ? parseInt(value) : 0;
	}

     /**
     * Returns the float value of a requested label.
     * @param {Label} label 
     * @returns {float} The actual value if exists, 0 otherwise.
     */
	getFloatValue(label: string): number {
		let value = this.getStringValue(label);
		return value ? parseFloat(value) : 0;
	}

    /**
     * @returns {int} The amount of nodes created by th query.
     */
	nodesCreated(): number {
		return this.getIntValue(Label.NODES_CREATED);
	}

    /**
     * @returns {int} The amount of nodes deleted by the query.
     */
	nodesDeleted(): number  {
		return this.getIntValue(Label.NODES_DELETED);
	}

    /**
     * @returns {int} The amount of labels created by the query.
     */
	labelsAdded(): number  {
		return this.getIntValue(Label.LABELS_ADDED);
	}

    /**
     * @returns {int} The amount of relationships deleted by the query.
     */
	relationshipsDeleted(): number  {
		return this.getIntValue(Label.RELATIONSHIPS_DELETED);
	}

    /**
     * @returns {int} The amount of relationships created by the query.
     */
	relationshipsCreated(): number  {
		return this.getIntValue(Label.RELATIONSHIPS_CREATED);
	}

    /**
     * @returns {int} The amount of properties set by the query.
     */
	propertiesSet(): number  {
		return this.getIntValue(Label.PROPERTIES_SET);
	}

    /**
     * @returns {int} The amount of indices created by the query.
     */
	indicesCreated(): number  {
		return this.getIntValue(Label.INDICES_CREATED);
	}

    /**
     * @returns {int} The amount of indices deleted by the query.
     */
	indicesDeleted(): number  {
		return this.getIntValue(Label.INDICES_DELETED);
    }

    /**
     * @returns {boolean} The execution plan was cached on RedisGraph.
     */
    cachedExecution(): boolean  {
        return  this.getIntValue(Label.CACHED_EXECUTION) == 1;
    }

    /**
     * @returns {float} The query execution time in ms.
     */
	queryExecutionTime(): number  {
		return this.getFloatValue(Label.QUERY_INTERNAL_EXECUTION_TIME);
	}
}

