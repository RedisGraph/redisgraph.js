export = Record;
/**
 * Hold a query record
 */
declare class Record {
    /**
     * Builds a Record object
     *
     * @param {string[]} header
     * @param {object[]} values
     */
    constructor(header: string[], values: object[]);
    _header: string[];
    _values: any[];
    /**
     * Returns a value of the given schema key or in the given position.
     * @param {string | number} key (integer)
     * @returns {object} Requested value.
     */
    get(key: string | number): object;
    /**
     * Returns a string representation for the value of the given schema key or in the given position.
     * @param {string | number} key (integer)
     * @returns {string} Requested string representation of the value.
     */
    getString(key: string | number): string;
    /**
     * @returns {string[]} The record header - List of strings.
     */
    keys(): string[];
    /**
     * @returns {object[]} The record values - List of values.
     */
    values(): object[];
    /**
     * Returns if the header contains a given key.
     * @param {string} key
     * @returns {boolean} true if header contains key.
     */
    containsKey(key: string): boolean;
    /**
     * @returns {number} The amount of values in the record. (integer)
     */
    size(): number;
}
