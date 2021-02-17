export = ResultSet;
/**
 * Hold a query result
 */
declare class ResultSet {
    /**
     * Builds an empty ResultSet object.
     *
     * @param {Graph} graph
     */
    constructor(graph: Graph);
    _graph: import("./graph");
    _position: number;
    _resultsCount: number;
    _header: any[];
    _results: any[];
    /**
     * Parse raw response data to ResultSet object.
     * @async
     * @param {object[]} resp  - raw response representation - the raw representation of response is at most 3 lists of objects.
     *                    The last list is the statistics list.
     */
    parseResponse(resp: object[]): Promise<this>;
    _statistics: Statistics;
    /**
     * Parse a raw response body into header an records.
     * @async
     * @param {object[]} resp raw response
     */
    parseResults(resp: object[]): Promise<void>;
    /**
     * A raw representation of a header (query response schema) is a list.
     * Each entry in the list is a tuple (list of size 2).
     * tuple[0] represents the type of the column, and tuple[1] represents the name of the column.
     * @param {object[]} rawHeader raw header
     */
    parseHeader(rawHeader: object[]): void;
    _typelessHeader: any[];
    /**
     * The raw representation of response is at most 3 lists of objects. rawResultSet[1] contains the data records.
     * Each entry in the record can be either a node, an edge or a scalar
     * @async
     * @param {object[]} rawResultSet raw result set representation
     */
    parseRecords(rawResultSet: object[]): Promise<void>;
    /**
     * Parse raw entity properties representation into a Map
     * @async
     * @param {object[]} props raw properties representation
     * @returns {Promise<object>} Map with the parsed properties.
     */
    parseEntityProperties(props: object[]): Promise<object>;
    /**
     * Parse raw node representation into a Node object.
     * @async
     * @param {object[]} cell raw node representation.
     * @returns {Promise<Node>} Node object.
     */
    parseNode(cell: object[]): Promise<Node>;
    /**
     * Parse a raw edge representation into an Edge object.
     * @async
     * @param {object[]} cell raw edge representation
     * @returns {Promise<Edge>} Edge object.
     */
    parseEdge(cell: object[]): Promise<Edge>;
    /**
     * Parse and in-place replace raw array into an array of values or objects.
     * @async
     * @param {object[]} rawArray raw array representation
     * @returns {Promise<object[]>} Parsed array.
     */
    parseArray(rawArray: object[]): Promise<object[]>;
    /**
     * Parse a raw path representation into Path object.
     * @async
     * @param {object[]} rawPath raw path representation
     * @returns {Promise<Path>} Path object.
     */
    parsePath(rawPath: object[]): Promise<Path>;
    /**
     * Parse a raw map representation into Map object.
     * @async
     * @param {object[]} rawMap raw map representation
     * @returns {Promise<object>} Map object.
     */
    parseMap(rawMap: object[]): Promise<object>;
    /**
     * Parse a raw value into its actual value.
     * @async
     * @param {object[]} cell raw value representation
     * @returns {Promise<object>} Actual value - scalar, array, Node, Edge, Path
     */
    parseScalar(cell: object[]): Promise<object>;
    /**
     * @returns {string[] }ResultSet's header.
     */
    getHeader(): string[];
    /**
     * @returns {boolean} If the ResultSet object can return additional records.
     */
    hasNext(): boolean;
    /**
     * @returns {Record} The current record.
     */
    next(): Record;
    /**
     * @returns {Statistics} ResultsSet's statistics.
     */
    getStatistics(): Statistics;
    /**
     * @returns {number} Result set size. (integer)
     */
    size(): number;
}
declare namespace ResultSet {
    export { Graph };
}
import Statistics = require("./statistics");
import Node = require("./node");
import Edge = require("./edge");
import Path = require("./path");
import Record = require("./record");
type Graph = import("./graph");
