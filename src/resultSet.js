const Statistics = require("./statistics"),
	Record = require("./record"),
	Node = require("./node"),
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

		if(resp.length == 1) {
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
        return rawResultSet[0];
	}

	parseHeader(rawResultSet) {
        // An array of column name/column type pairs.
        return rawResultSet[1];
	}

	parseRecords(rawResultSet) {
        let resultSet = rawResultSet[2];
        this._results = new Array(resultSet.length);

        for(var i = 0; i < resultSet.length; i++) {
        	let row = resultSet[i];
            let record = new Array(row.length);
            for(var j = 0; j < row.length; j++) {
            	let cell = row[j];
                switch(this._header[j][0]) {
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
            let propName =  this._stringMapping[prop[0]];
            properties[propName] = this.parseScalar(prop.slice(1, prop.length));
        }
        return properties;
    }

	parseNode(cell) {
        // Node ID (integer),
        // [label string offset (integer)],
        // [[name, value, value type] X N]

        let nodeID  Number(cell[0]);
        let label = null;
        if (cell[1].length != 0) {
            label = this._stringMapping[cell[1][0]];
        }
        let properties = this.parseEntityProperties(cell[2]);
        return new Node(nodeID, null, label, properties);
    }

    parseEdge(cell) {
        // Edge ID (integer),
        // reltype string offset (integer),
        // src node ID offset (integer),
        // dest node ID offset (integer),
        // [[name, value, value type] X N]

        let edgeID = Number(cell[0]);
        let relation = this._stringMapping[cell[1]];
        let srcNodeID = Number(cell[2]);
        let destNodeID = Number(cell[3]);
        let properties = this.parseEntityProperties(cell[4]);
        return new Edge(srcNodeID, relation, destNodeID, edgeID, properties);
    }

	parseScalar(cell) {
        let scalarType = cell[0];
        let value = cell[1];
        switch(scalarType) {
            case ResultSetScalarTypes.PROPERTY_NULL:
                return null;
            case ResultSetScalarTypes.PROPERTY_STRING:
                return String(value);
            case ResultSetScalarTypes.PROPERTY_INTEGER:
            case ResultSetScalarTypes.PROPERTY_DOUBLE:
                return Number(value);
            case ResultSetScalarTypes.PROPERTY_BOOLEAN:
                if (value == "true") {
                    return true;
                }
                if (value == "false") {
                    return false;
                }
                else {
                    console.log("Unknown boolean type\n");
                    return undefined;
                }
            case ResultSetScalarTypes.PROPERTY_UNKNOWN:
            default:
                console.log("Unknown scalar type\n");
                return undefined;
        }
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
