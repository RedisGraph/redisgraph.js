import { Statistics } from "./statistics"
import { Record } from "./record";

type Header = string[]

/**
 * Hold a query result
 */
export class ResultSet {
	private _position: number
	private _header: Header
	private _totalResults: number
	private _results: Record[]
	private _statistics: Statistics

	constructor(resp: any) {
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
