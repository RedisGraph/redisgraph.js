export = Graph;
/**
 * RedisGraph client
 */
declare class Graph {
    /**
     * Creates a client to a specific graph running on the specific host/post
     * See: node_redis for more options on createClient
     *
     * @param {string} graphId the graph id
     * @param {string | import('redis').RedisClient} [host] Redis host or node_redis client
     * @param {string | number} [port] Redis port (integer)
     * @param {Object} [options] node_redis options
     */
    constructor(graphId: string, host?: string | import('redis').RedisClient, port?: string | number, options?: any);
    _graphId: string;
    _labels: any[];
    _relationshipTypes: any[];
    _properties: any[];
    _labelsPromise: Promise<string[]>;
    _propertyPromise: Promise<string[]>;
    _relationshipPromise: Promise<string[]>;
    _client: any;
    _sendCommand: any;
    /**
     * Closes the client.
     */
    close(): void;
    /**
     * Auxiliary function to extract string(s) data from procedures such as:
     * db.labels, db.propertyKeys and db.relationshipTypes
     * @param {import('./resultSet')} resultSet - a procedure result set
     * @returns {string[]} strings array.
     */
    _extractStrings(resultSet: import('./resultSet')): string[];
    /**
     * Transforms a parameter value to string.
     * @param {*} paramValue
     * @returns {string} the string representation of paramValue.
     */
    paramToString(paramValue: any): string;
    /**
     * Extracts parameters from dictionary into cypher parameters string.
     * @param {Map} params parameters dictionary.
     * @return {string} a cypher parameters string.
     */
    buildParamsHeader(params: Map<any, any>): string;
    /**
     * Execute a Cypher query
     * @async
     * @param {string} query Cypher query
     * @param {Map} [params] Parameters map
     * @returns {Promise<import('./resultSet')>} a promise contains a result set
     */
    query(query: string, params?: Map<any, any>): Promise<import('./resultSet')>;
    /**
     * Deletes the entire graph
     * @async
     * @returns {Promise<import('./resultSet')>} a promise contains the delete operation running time statistics
     */
    deleteGraph(): Promise<import('./resultSet')>;
    /**
     * Calls procedure
     * @param {string} procedure Procedure to call
     * @param {string[]} [args] Arguments to pass
     * @param {string[]} [y] Yield outputs
     * @returns {Promise<import('./resultSet')>} a promise contains the procedure result set data
     */
    callProcedure(procedure: string, args?: string[], y?: string[]): Promise<import('./resultSet')>;
    /**
     * Retrieves all labels in graph.
     * @async
     */
    labels(): Promise<void>;
    /**
     * Retrieves all relationship types in graph.
     * @async
     */
    relationshipTypes(): Promise<void>;
    /**
     * Retrieves all properties in graph.
     * @async
     */
    propertyKeys(): Promise<void>;
    /**
     * Retrieves label by ID.
     * @param {number} id internal ID of label. (integer)
     * @returns {string} String label.
     */
    getLabel(id: number): string;
    /**
     * Retrieve all the labels from the graph and returns the wanted label
     * @async
     * @param {number} id internal ID of label. (integer)
     * @returns {Promise<string>} String label.
     */
    fetchAndGetLabel(id: number): Promise<string>;
    /**
     * Retrieves relationship type by ID.
     * @param {number} id internal ID of relationship type. (integer)
     * @returns {string} relationship type.
     */
    getRelationship(id: number): string;
    /**
     * Retrieves al the relationships types from the graph, and returns the wanted type
     * @async
     * @param {number} id internal ID of relationship type. (integer)
     * @returns {Promise<string>} String relationship type.
     */
    fetchAndGetRelationship(id: number): Promise<string>;
    /**
     * Retrieves property name by ID.
     * @param {number} id internal ID of property. (integer)
     * @returns {string} String property.
     */
    getProperty(id: number): string;
    /**
     * Retrieves al the properties from the graph, and returns the wanted property
     * @asyncTODO
     * @param {number} id internal ID of property. (integer)
     * @returns {Promise<string>} String property.
     */
    fetchAndGetProperty(id: number): Promise<string>;
}
