import Statistics from "./statistics";
import Record from "./record";

/**
 * Hold a query result
 */
class ResultSet {
  constructor(resp) {
    this._position = 0;
    this._statistics = new Statistics(resp[1]);

    let result = resp[0];

    // Empty result set
    if (result === null || result.length === 0) {
      this._header = [];
      this._totalResults = 0;
      this._results = [];
    } else {
      this._header = result[0];
      this._totalResults = result.length - 1;
      this._results = new Array(this._totalResults);
      for (let i = 0; i < this._totalResults; ++i) {
        this._results[i] = new Record(this._header, result[i + 1]);
      }
    }
  }

  getHeader() {
    return this._header;
  }

  hasNext() {
    return this._position < this._totalResults;
  }

  next() {
    return this._results[this._position++];
  }

  getStatistics() {
    return this._statistics;
  }
}

export default ResultSet;
