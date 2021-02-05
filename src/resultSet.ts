import { Edge } from "./edge";
import { Graph } from "./graph";
import { Node } from "./node";
import { Path } from "./path";
import { Record } from "./record";
import { ReplyError } from "redis";
import { Statistics } from "./statistics";

const ResultSetColumnTypes = {
  COLUMN_UNKNOWN: 0,
  COLUMN_SCALAR: 1,
  COLUMN_NODE: 2,
  COLUMN_RELATION: 3,
};

const ResultSetValueTypes = {
  VALUE_UNKNOWN: 0,
  VALUE_NULL: 1,
  VALUE_STRING: 2,
  VALUE_INTEGER: 3,
  VALUE_BOOLEAN: 4,
  VALUE_DOUBLE: 5,
  VALUE_ARRAY: 6,
  VALUE_EDGE: 7,
  VALUE_NODE: 8,
  VALUE_PATH: 9,
  VALUE_MAP: 10,
};

/**
 * Hold a query result
 */
export class ResultSet {
  /**
   * Builds an empty ResultSet object.
   * @constructor
   * @param {Graph} graph
   */
  private _position = 0; //allowing iterator like behevior
  private _resultsCount = 0; //total number of records in this result set
  private _header: any[] = []; //reponse schema columns labels
  private _results: any[] = []; //result records
  private _statistics?: Statistics;

  private _typelessHeader: string[];
  constructor(private _graph: Graph) {
    //this._graph = graph; //_graph is graph api
    this._position = 0; //allowing iterator like behevior
    this._resultsCount = 0; //total number of records in this result set
    this._header = []; //reponse schema columns labels
	this._results = []; //result records
	this._typelessHeader = [];
  }

  /**
   * Parse raw response data to ResultSet object.
   * @async
   * @param {object[]} resp  - raw response representation - the raw representation of response is at most 3 lists of objects.
   *                    The last list is the statistics list.
   */
  async parseResponse(resp: any[]) {
    if (Array.isArray(resp)) {
      let statistics = resp[resp.length - 1];
      if (statistics instanceof ReplyError) throw statistics;
      if (resp.length < 3) {
        this._statistics = new Statistics(statistics);
      } else {
        await this.parseResults(resp);
        this._resultsCount = this._results.length;
        this._statistics = new Statistics(resp[2]);
      }
    } else {
      this._statistics = new Statistics(resp);
    }
    return this;
  }

  /**
   * Parse a raw response body into header an records.
   * @async
   * @param {object[]} resp raw response
   */
  async parseResults(resp: any[]) {
    this.parseHeader(resp[0]);
    await this.parseRecords(resp);
  }

  /**
   * A raw representation of a header (query response schema) is a list.
   * Each entry in the list is a tuple (list of size 2).
   * tuple[0] represents the type of the column, and tuple[1] represents the name of the column.
   * @param {object[]} rawHeader raw header
   */
  parseHeader(rawHeader: any[]) {
    // An array of column name/column type pairs.
    this._header = rawHeader;
    // Discard header types.
    this._typelessHeader = new Array(this._header.length);
    for (var i = 0; i < this._header.length; i++) {
      this._typelessHeader[i] = this._header[i][1];
    }
  }

  /**
   * The raw representation of response is at most 3 lists of objects. rawResultSet[1] contains the data records.
   * Each entry in the record can be either a node, an edge or a scalar
   * @async
   * @param {object[]} rawResultSet raw result set representation
   */
  async parseRecords(rawResultSet: any[]) {
    let result_set = rawResultSet[1];
    this._results = new Array(result_set.length);

    for (var i = 0; i < result_set.length; i++) {
      let row = result_set[i];
      let record = new Array(row.length);
      for (var j = 0; j < row.length; j++) {
        let cell = row[j];
        let cellType = this._header[j][0];
        switch (cellType) {
          case ResultSetColumnTypes.COLUMN_SCALAR:
            record[j] = await this.parseScalar(cell);
            break;
          case ResultSetColumnTypes.COLUMN_NODE:
            record[j] = await this.parseNode(cell);
            break;
          case ResultSetColumnTypes.COLUMN_RELATION:
            record[j] = await this.parseEdge(cell);
            break;
          default:
            console.log("Unknown column type.\n" + cellType);
            break;
        }
      }
      this._results[i] = new Record(this._typelessHeader, record);
    }
  }

  /**
   * Parse raw entity properties representation into a Map
   * @async
   * @param {object[]} props raw properties representation
   * @returns {Map} Map with the parsed properties.
   */
  async parseEntityProperties(props: any[]) {
    // [[name, value, value type] X N]
    let properties: any = {};
    for (var i = 0; i < props.length; i++) {
      let prop = props[i];
      var propIndex = prop[0];
      let prop_name = this._graph.getProperty(propIndex);
      // will try to get the right property for at most 10 times
      var tries = 0;
      while (prop_name == undefined && tries < 10) {
        prop_name = await this._graph.fetchAndGetProperty(propIndex);
        tries++;
      }
      if (prop_name == undefined) {
        console.warn(
          "unable to retrive property name value for propety index " + propIndex
        );
      }
      let prop_value = await this.parseScalar(prop.slice(1, prop.length));
      properties[prop_name] = prop_value;
    }
    return properties;
  }

  /**
   * Parse raw node representation into a Node object.
   * @async
   * @param {object[]} cell raw node representation.
   * @returns {Node} Node object.
   */
  async parseNode(cell: any[]) {
    // Node ID (integer),
    // [label string offset (integer)],
    // [[name, value, value type] X N]

    let node_id = cell[0];
    let label = this._graph.getLabel(cell[1][0]);
    // will try to get the right label for at most 10 times
    var tries = 0;
    while (label == undefined && tries < 10) {
      label = await this._graph.fetchAndGetLabel(cell[1][0]);
      tries++;
    }
    if (label == undefined) {
      console.warn(
        "unable to retrive label value for label index " + cell[1][0]
      );
    }
    let properties = await this.parseEntityProperties(cell[2]);
    let node = new Node(label, properties);
    node.setId(node_id);
    return node;
  }

  /**
   * Parse a raw edge representation into an Edge object.
   * @async
   * @param {object[]} cell raw edge representation
   * @returns {Edge} Edge object.
   */
  async parseEdge(cell: any[]): Promise<Edge> {
    // Edge ID (integer),
    // reltype string offset (integer),
    // src node ID offset (integer),
    // dest node ID offset (integer),
    // [[name, value, value type] X N]

    let edge_id = cell[0];
    let relation = this._graph.getRelationship(cell[1]);
    // will try to get the right relationship type for at most 10 times
    var tries = 0;
    while (relation == undefined && tries < 10) {
      relation = await this._graph.fetchAndGetRelationship(cell[1]);
      tries++;
    }
    if (relation == undefined) {
      console.warn(
        "unable to retrive relationship type value for relationship index " +
          cell[1]
      );
    }
    let src_node_id = cell[2];
    let dest_node_id = cell[3];
    let properties = await this.parseEntityProperties(cell[4]);
    let edge = new Edge(src_node_id, relation, dest_node_id, properties);
    edge.setId(edge_id);
    return edge;
  }

  /**
   * Parse and in-place replace raw array into an array of values or objects.
   * @async
   * @param {object[]} rawArray raw array representation
   * @returns {object[]} Parsed array.
   */
  async parseArray(rawArray: any[]): Promise<any[]> {
    for (var i = 0; i < rawArray.length; i++) {
      rawArray[i] = await this.parseScalar(rawArray[i]);
    }
    return rawArray;
  }

  /**
   * Parse a raw path representation into Path object.
   * @async
   * @param {object[]} rawPath raw path representation
   * @returns {Path} Path object.
   */
  async parsePath(rawPath: any[]): Promise<Path> {
    let nodes = await this.parseScalar(rawPath[0]);
    let edges = await this.parseScalar(rawPath[1]);
    return new Path(nodes, edges);
  }

  /**
   * Parse a raw map representation into Map object.
   * @async
   * @param {object[]} rawMap raw map representation
   * @returns {Map} Map object.
   */
  async parseMap(rawMap: any[]): Promise<any> {
    let m: any = {};
    for (var i = 0; i < rawMap.length; i += 2) {
      var key = rawMap[i];
      m[key] = await this.parseScalar(rawMap[i + 1]);
    }

    return m;
  }

  /**
   * Parse a raw value into its actual value.
   * @async
   * @param {object[]} cell raw value representation
   * @returns {object} Actual value - scalar, array, Node, Edge, Path
   */
  async parseScalar(cell: any[]): Promise<any> {
    let scalar_type = cell[0];
    let value = cell[1];
    let scalar = undefined;

    switch (scalar_type) {
      case ResultSetValueTypes.VALUE_NULL:
        scalar = null;
        break;
      case ResultSetValueTypes.VALUE_STRING:
        scalar = String(value);
        break;
      case ResultSetValueTypes.VALUE_INTEGER:
      case ResultSetValueTypes.VALUE_DOUBLE:
        scalar = Number(value);
        break;
      case ResultSetValueTypes.VALUE_BOOLEAN:
        if (value === "true") {
          scalar = true;
        } else if (value === "false") {
          scalar = false;
        } else {
          console.log("Unknown boolean type\n");
        }
        break;
      case ResultSetValueTypes.VALUE_ARRAY:
        scalar = this.parseArray(value);
        break;
      case ResultSetValueTypes.VALUE_NODE:
        scalar = await this.parseNode(value);
        break;
      case ResultSetValueTypes.VALUE_EDGE:
        scalar = await this.parseEdge(value);
        break;
      case ResultSetValueTypes.VALUE_PATH:
        scalar = await this.parsePath(value);
        break;

      case ResultSetValueTypes.VALUE_MAP:
        scalar = await this.parseMap(value);
        break;

      case ResultSetValueTypes.VALUE_UNKNOWN:
        console.log("Unknown scalar type\n");
        break;
    }
    return scalar;
  }

  /**
   * @returns {string[] }ResultSet's header.
   */
  getHeader() {
    return this._typelessHeader;
  }

  /**
   * @returns {boolean} If the ResultSet object can return additional records.
   */
  hasNext() {
    return this._position < this._resultsCount;
  }

  /**
   * @returns {Record} The current record.
   */
  next() {
    return this._results[this._position++];
  }

  /**
   * @returns {Statistics} ResultsSet's statistics.
   */
  getStatistics() {
    return this._statistics;
  }

  /**
   * @returns {int} Result set size.
   */
  size() {
    return this._resultsCount;
  }
}
