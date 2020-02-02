"use strict";
const assert = require("assert"),
	Record = require("../src/record");

describe("Record Test", () => {
	describe('getString()', () => {
		const recordUnderTest = new Record([
			"key",
			"keyForEmptyString",
			"keyForZero",
			"keyForTwelve",
			"keyForNullValue"
		], [
			"valueForKey",
			"",
			0,
			12,
			null
		]);

		context('key is not given', () => {
			it('returns null', () => {
				assert.equal(recordUnderTest.getString(), null);
			});
		});
		context('key is undefined', () => {
			it('returns null', () => {
				assert.equal(recordUnderTest.getString(undefined), null);
			});
		});
		context('value is empty string', () => {
			it('returns empty string', () => {
				assert.equal(recordUnderTest.getString('keyForEmptyString'), '');
			});
		});
		context('value is zero (0)', () => {
			it('returns zero (0) as string', () => {
				assert.equal(recordUnderTest.getString('keyForZero'), '0');
			});
		});
		context('value is non-zero integer', () => {
			it('returns non-zero integer as string', () => {
				assert.equal(recordUnderTest.getString('keyForTwelve'), '12');
			});
		});
		context('value is string', () => {
			it('returns value', () => {
				assert.equal(recordUnderTest.getString('key'), 'valueForKey');
			});
		});
		context('value is null', () => {
			it('returns null', () => {
				assert.equal(recordUnderTest.getString('keyForNullValue'), null);
			});
		});
	});
});
