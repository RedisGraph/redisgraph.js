type Header = string[]
type Values = string[]


/**
 * Hold a query record
 */
export class Record {
	private _header: Header;
	private _values: Values;

	constructor(header: Header, values: Values) {
		this._header = header;
		this._values = values;
	}

	getString(key: string|number) {
		let index: string|number = key;
		if (typeof key === "string") {
			index = this._header.indexOf(key);
		}
		return this._values[Number(index)];
	}

	keys() {
		return this._header;
	}

	values() {
		return this._values;
	}

	containsKey(key: string) {
		return this._header.includes(key);
	}

	size() {
		return this._header.length;
	}
}
