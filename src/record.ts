"use strict";
/**
 * Hold a query record
 */
export class Record {
  /**
   * Builds a Record object
   * @constructor
   * @param {string[]} header
   * @param {object[]} values
   */
  constructor(private _header: string[], private _values: any[]) {}

  /**
   * Returns a value of the given schema key or in the given position.
   * @param {string | int} key
   * @returns {object} Requested value.
   */
  get(key: string | number) {
    const index: number =
      typeof key === "string" ? this._header.indexOf(key) : key;
    return this._values[index];
  }

  /**
   * Returns a string representation for the value of the given schema key or in the given position.
   * @param {string | int} key
   * @returns {string} Requested string representation of the value.
   */
  getString(key: string | number) {
	const index: number =
	typeof key === "string" ? this._header.indexOf(key) : key;

    let value = this._values[index];
    if (value !== undefined && value !== null) {
      return value.toString();
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
  containsKey(key: string) {
    return this._header.includes(key);
  }

  /**
   * @returns {int} The amount of values in the record.
   */
  size() {
    return this._header.length;
  }
}
