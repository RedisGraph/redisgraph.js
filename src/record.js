"use strict";
/**
 * Hold a query record
 */
class Record {
    /**
     * Builds a Record object
     * @constructor
     * @param {string[]} header 
     * @param {object[]} values 
     */
	constructor(header, values) {
		this._header = header;
		this._values = values;
	}

    /**
     * Returns a value of the given schema key or in the given position.
     * @param {string | int} key
     * @returns {object} Requested value.
     */
	get(key) {
		let index = key;
		if (typeof key === "string") {
			index = this._header.indexOf(key);
		}
		return this._values[index];
	}

    /**
     * Returns a string representation for the value of the given schema key or in the given position.
     * @param {string | int} key
     * @returns {string} Requested string representation of the value.
     */
	getString(key) {
		let index = key;
		if (typeof key === "string") {
			index = this._header.indexOf(key);
		}

		if (this._values[index]) {
			return this._values[index].toString();
		}

		return null;
	}

    /**
     * @returns {string[]} The record header - List of strings.
     */
	keys() {
		return this._header;
	}

    /**
     * @returns {object[]} The record values - List of values.
     */
	values() {
		return this._values;
	}

    /**
     * Returns if the header contains a given key.
     * @param {string} key 
     * @returns {boolean} true if header contains key.
     */
	containsKey(key) {
		return this._header.includes(key);
	}

    /**
     * @returns {int} The amount of values in the record.
     */
	size() {
		return this._header.length;
	}
}

module.exports = Record;
