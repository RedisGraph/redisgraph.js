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
	constructor(resp) {
		this._position = 0;
        this._resultsCount = 0;
		this._header = [];
		this._results = [];

        if(resp.length === 1) {
            this._statistics = new Statistics(resp[0]);
        } else{
    		this.parseResults(resp);
    		this._resultsCount = this._results.length;
            this._statistics = new Statistics(resp[3]);
        }
	}

	parseResults(resp) {
        this._stringMapping = this.parseStringMapping(resp);
        this._header = this.parseHeader(resp);
        
        // Discard header types.
        this._typelessHeader = new Array(this._header.length);
        for(var i = 0; i < this._header.length; i++) {
            this._typelessHeader[i] = this._header[i][1];
        }

        this.parseRecords(resp);
	}

    parseStringMapping(rawResultSet) {
        // An array of strings, which are referred to
        // by other parts of the result-set.
        let string_mapping = rawResultSet[0];
        return string_mapping;
	}

	parseHeader(rawResultSet) {
        // An array of column name/column type pairs.
        let header = rawResultSet[1];
        return header;
	}

	parseRecords(rawResultSet) {
        let result_set = rawResultSet[2];
        let records = new Array(result_set.length);
        this._results = new Array(result_set.length);

        for(var i = 0; i < result_set.length; i++) {
        	let row = result_set[i];
            let record = new Array(row.length);
            for(var j = 0; j < row.length; j++) {
            	let cell = row[j];
                let cellType = this._header[j][0];
                switch(cellType) {
                    case ResultSetColumnTypes.COLUMN_SCALAR:
                        record[j] = this.parseScalar(cell);
                        break;
                    case ResultSetColumnTypes.COLUMN_NODE:
                        record[j] = this.parseNode(cell);
                        break;
                    case ResultSetColumnTypes.COLUMN_RELATION:
                        record[j] = this.parseEdge(cell);
                        break;
                    default:
                        console.log("Unknown column type.\n");
                        break;
                }
            }
            this._results[i] = new Record(this._typelessHeader, record);
        }
    }

    parseEntityProperties(props) {
        // [[name, value, value type] X N]
        let properties = {}
        for(var i = 0; i < props.length; i++) {
        	let prop = props[i];
            let prop_name =  this._stringMapping[prop[0]];
            let prop_value = this.parseScalar(prop.slice(1, prop.length));
            properties[prop_name] = prop_value;
        }

        return properties;
    }

	parseNode(cell) {
        // Node ID (integer),
        // [label string offset (integer)],
        // [[name, value, value type] X N]

        let node_id = Number(cell[0]);
        let label = null;
        if (cell[1].length != 0) {
            label = this._stringMapping[cell[1][0]];
        }
        let properties = this.parseEntityProperties(cell[2]);
        return new Node(node_id, null, label, properties);
    }

    parseEdge(cell) {
        // Edge ID (integer),
        // reltype string offset (integer),
        // src node ID offset (integer),
        // dest node ID offset (integer),
        // [[name, value, value type] X N]

        let edge_id = Number(cell[0]);
        let relation = this._stringMapping[cell[1]];
        let src_node_id = Number(cell[2]);
        let dest_node_id = Number(cell[3]);
        let properties = this.parseEntityProperties(cell[4]);
        return new Edge(src_node_id, relation, dest_node_id, edge_id, properties);
    }

	parseScalar(cell) {
        let scalar_type = cell[0];
        let value = cell[1];
        let scalar;

        switch(scalar_type) {
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
                if(value === "true") {
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
