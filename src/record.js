/**
 * Hold a query record
 */
class Record {
    constructor(header, values) {
        this._header = header;
        this._values = values;
    }

    get(key) {
        let index = key;
        if (typeof key === "string") {
            index = this._header.indexOf(key);
        }
        return this._values[index];
    }

    getString(key) {
        let index = key;
        if (typeof key === "string") {
            index = this._header.indexOf(key);
        }
        return this._values[index] ? this._values[index].toString() : null;
    }

    keys() {
        return this._header;
    }

    values() {
        return this._values;
    }

    containsKey(key) {
        return this._header.includes(key);
    }

    size() {
        return this._header.length;
    }
}

module.exports = Record;
