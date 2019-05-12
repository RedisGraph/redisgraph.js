const Statistics = require("./statistics"),
    Record = require("./record");
Node = require("./node");
Edge = require("./edge");

const ResultSetColumnTypes = {
    COLUMN_UNKNOWN: 0,
    COLUMN_SCALAR: 1,
    COLUMN_NODE: 2,
    COLUMN_RELATION: 3
}

const ResultSetScalarTypes = {
    PROPERTY_UNKNOWN: 0,
    PROPERTY_NULL: 1,
    PROPERTY_STRING: 2,
    PROPERTY_INTEGER: 3,
    PROPERTY_BOOLEAN: 4,
    PROPERTY_DOUBLE: 5
}

/**
 * Hold a query result
 */
class ResultSet {
    constructor(graph) {
        //_graph is graph api
        this._graph = graph;
        //allowing iterator like behevior
        this._position = 0;
        //total number of records in this result set
        this._resultsCount = 0;
        //reponse schame columns labels
        this._header = [];
        //result recordsd
        this._results = [];
    }

    /**
     * 
     * @param  resp  - raw response representation - the raw representation of response is at most 3 lists of objects.
     *                    The last list is the statistics list.
     */
    async parseResponse(resp) {
        if (Array.isArray(resp)) {
            if (resp.length < 3) {
                this._statistics = new Statistics(resp[resp.length - 1]);
            } else {
                await this.parseResults(resp);
                this._resultsCount = this._results.length;
                this._statistics = new Statistics(resp[2]);
            }
        }
        else {
            this._statistics = new Statistics(resp);
        }
        return this;
    }

    async parseResults(resp) {
        this.parseHeader(resp[0]);
        await this.parseRecords(resp);
    }

    /**
     * A raw representation of a header (query response schema) is a list.
     * Each entry in the list is a tuple (list of size 2).
     * tuple[0] represents the type of the column, and tuple[1] represents the name of the column.
     * @param  rawHeader 
     */
    parseHeader(rawHeader) {
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
     * @param  rawResultSet 
     */
    async parseRecords(rawResultSet) {
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
                        record[j] = this.parseScalar(cell);
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

    async parseEntityProperties(props) {
        // [[name, value, value type] X N]
        let properties = {}
        for (var i = 0; i < props.length; i++) {
            let prop = props[i];
            var propIndex = prop[0];
            let prop_name = this._graph.getProperty(propIndex);
            if (prop_name == undefined) {
                console.error("fetching property labels");
                prop_name = await this._graph.fetchAndGetProperty(propIndex);
            }
            let prop_value = this.parseScalar(prop.slice(1, prop.length));
            properties[prop_name] = prop_value;
        }
        return properties;
    }

    async parseNode(cell) {
        // Node ID (integer),
        // [label string offset (integer)],
        // [[name, value, value type] X N]

        let node_id = cell[0];
        let label = this._graph.getLabel(cell[1][0]);
        if (label == undefined) {
            console.error("fetching node labels")
            label = await this._graph.fetchAndGetLabel(cell[1][0]);
        }
        let properties = await this.parseEntityProperties(cell[2]);
        let node = new Node(label, properties);
        node.setId(node_id);
        return node;
    }

    async parseEdge(cell) {
        // Edge ID (integer),
        // reltype string offset (integer),
        // src node ID offset (integer),
        // dest node ID offset (integer),
        // [[name, value, value type] X N]

        let edge_id = cell[0];
        let relation = this._graph.getRelationship(cell[1]);
        if (relation == undefined) {
            console.error("fetching relationship types")
            relation = await this._graph.fetchAndGetRelationship(cell[1])
        }
        let src_node_id = cell[2];
        let dest_node_id = cell[3];
        let properties = await this.parseEntityProperties(cell[4]);
        let edge = new Edge(src_node_id, relation, dest_node_id, properties);
        edge.setId(edge_id);
        return edge;
    }

    parseScalar(cell) {
        let scalar_type = cell[0];
        let value = cell[1];
        let scalar = undefined;

        switch (scalar_type) {
            case ResultSetScalarTypes.PROPERTY_NULL:
                scalar = null;
                break;
            case ResultSetScalarTypes.PROPERTY_STRING:
                scalar = String(value);
                break;
            case ResultSetScalarTypes.PROPERTY_INTEGER:
            case ResultSetScalarTypes.PROPERTY_DOUBLE:
                scalar = Number(value);
                break;
            case ResultSetScalarTypes.PROPERTY_BOOLEAN:
                if (value === "true") {
                    scalar = true;
                } else if (value === "false") {
                    scalar = false;
                } else {
                    console.log("Unknown boolean type\n");
                }
                break;
            case ResultSetScalarTypes.PROPERTY_UNKNOWN:
                console.log("Unknown scalar type\n");
                break;
        }
        return scalar;
    }

    getHeader() {
        return this._typelessHeader;
    }

    hasNext() {
        return this._position < this._resultsCount;
    }

    next() {
        return this._results[this._position++];
    }

    getStatistics() {
        return this._statistics;
    }
}

module.exports = ResultSet;
