const Statistics = require('./statistics').Statistics;

/**
 * Hold a query result
 */
module.exports = class ResultSet {

    constructor(resp) {

    	this._position = 1;
    	this._statistics = new Statistics(resp[1]);
    	this._results = resp[0];
    	
        // Empty result set
        if(this._results === null || this._results.length === 0) {
        	this._header = [];
            this._totalResults = 0;
        } else {
        	this._header = this._results[0];

        	// First row is a header row
        	this._totalResults = this._results.length - 1;
        }
    }
    
    getHeader(){
    	return this._header;
    }
	
	hasNext() {
		return this._position <= this._totalResults;
	}

	next() {
		return this._results[this._position++];
	}

	getStatistics() {
		return this._statistics;
	}
};
