export = Statistics;
declare class Statistics {
    /**
     * Builds a query statistics object out of raw data.
     * @constructor
     * @param {object[]} raw - raw data.
     */
    constructor(raw: object[]);
    _raw: any[];
    /**
     * Returns a statistics value according to the statistics label.
     * @param {import('./label')} label - Statistics label.
     */
    getStringValue(label: import('./label')): string;
    /**
     * Return the query statistics
     * @return {Object<string, string>} statistics object
     */
    getStatistics(): {
        [x: string]: string;
    };
    _statistics: {};
    /**
     * Returns the integer value of a requested label.
     * @param {import('./label')} label
     * @returns {number} The actual value if exists, 0 otherwise. (integer)
     */
    getIntValue(label: import('./label')): number;
    /**
    * Returns the float value of a requested label.
    * @param {import('./label')} label
    * @returns {number} The actual value if exists, 0 otherwise.
    */
    getFloatValue(label: import('./label')): number;
    /**
     * @returns {number} The amount of nodes created by th query. (integer)
     */
    nodesCreated(): number;
    /**
     * @returns {number} The amount of nodes deleted by the query. (integer)
     */
    nodesDeleted(): number;
    /**
     * @returns {number} The amount of labels created by the query. (integer)
     */
    labelsAdded(): number;
    /**
     * @returns {number} The amount of relationships deleted by the query. (integer)
     */
    relationshipsDeleted(): number;
    /**
     * @returns {number} The amount of relationships created by the query. (integer)
     */
    relationshipsCreated(): number;
    /**
     * @returns {number} The amount of properties set by the query. (integer)
     */
    propertiesSet(): number;
    /**
     * @returns {number} The amount of indices created by the query. (integer)
     */
    indicesCreated(): number;
    /**
     * @returns {number} The amount of indices deleted by the query. (integer)
     */
    indicesDeleted(): number;
    /**
     * @returns {boolean} The execution plan was cached on RedisGraph.
     */
    cachedExecution(): boolean;
    /**
     * @returns {number} The query execution time in ms.
     */
    queryExecutionTime(): number;
}
