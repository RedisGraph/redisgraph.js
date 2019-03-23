const assert = require("assert"),
	redis = require("redis"),
	Label = require("../src/label"),
	RedisGraph = require("../src/redisGraph");

describe('RedisGraphAPI Test', () =>{
	const api = new RedisGraph("social");
	
	beforeEach( () => {
		return api.deleteGraph().catch(()=>{});
	});

	it("test bring your client", () => {
		return new RedisGraph("social", redis.createClient());
	});

	it("test Create Node", () => {
		// Create a node
		return api.query("CREATE ({name:'roi', age:34})").then(result => {
			assert.ok(!result.hasNext());
			assert.equal(1, result.getStatistics().nodesCreated());
			assert.ifError(
				result.getStatistics().getStringValue(Label.NODES_DELETED)
			);
			assert.ifError(
				result.getStatistics().getStringValue(Label.RELATIONSHIPS_CREATED)
			);
			assert.ifError(
				result.getStatistics().getStringValue(Label.RELATIONSHIPS_DELETED)
			);
			assert.equal(2, result.getStatistics().propertiesSet());
			assert.ok(result.getStatistics().queryExecutionTime()); // not 0
			assert.ok(result.getStatistics().getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME)); // exsits   
		});
	});

	it("test Create Labeled Node", () => {
		// Create a node with a label
		return api.query("CREATE (:human {name:'danny', age:12})").then(result => {
			assert.ok(!result.hasNext());
			assert.equal(
				"1",
				result.getStatistics().getStringValue(Label.NODES_CREATED)
			);
			assert.equal(
				"2",
				result.getStatistics().getStringValue(Label.PROPERTIES_SET)
			);
			assert.ok(
				result
					.getStatistics()
					.getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME)
			);
		});
	});

	it("test Connect Nodes", () => {
		// Create both source and destination nodes
		let createResult1 = api.query("CREATE (:person {name:'roi', age:34})");
		let createResult2 = api.query("CREATE (:person {name:'amit', age:32})");

		// Connect source and destination nodes.
		return api
			.query(
				"MATCH (a:person {name:'roi'}), (b:person {name:'amit'}) CREATE (a)-[:knows]->(b)"
			)
			.then(matchResult => {
				assert.ok(!matchResult.hasNext());
				assert.ifError(
					matchResult.getStatistics().getStringValue(Label.NODES_CREATED)
				);
				assert.ifError(
					matchResult.getStatistics().getStringValue(Label.PROPERTIES_SET)
				);
				assert.equal(1, matchResult.getStatistics().relationshipsCreated());
				assert.equal(0, matchResult.getStatistics().relationshipsDeleted());
				assert.ok(
					matchResult
						.getStatistics()
						.getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME)
				);
			});
	});

	it('test Query', () => {
		// Create both source and destination nodes    	
		return api.query("CREATE (r:human {name:'roi', age:34}), (a:human {name:'amit', age:32}), (r)-[:knows]->(a)")
		.then( (createResult) => {
			// Query
			return api.query("MATCH (r:human)-[:knows]->(a:human) RETURN r.age, r.name");
		})
		.then( (resultSet) => {	
			assert.ok(resultSet.hasNext());
			assert.equal(0, resultSet.getStatistics().nodesCreated());
			assert.equal(0, resultSet.getStatistics().nodesDeleted());
			assert.equal(0, resultSet.getStatistics().labelsAdded());
			assert.equal(0, resultSet.getStatistics().propertiesSet());
			assert.equal(0, resultSet.getStatistics().relationshipsCreated());
			assert.equal(0, resultSet.getStatistics().relationshipsDeleted());
			assert.ok(resultSet.getStatistics().getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME)); 

			assert.deepStrictEqual( [ 'r.age', 'r.name' ], resultSet.getHeader());
			
			let record = resultSet.next();
			assert.equal( 34, record.get(0));
			assert.equal( "34", record.getString(0));
			assert.equal( "roi", record.getString(1));
			assert.equal( "roi", record.getString("r.name"));			
			
			assert.deepStrictEqual( [ 'r.age', 'r.name' ], record.keys());
			assert.deepStrictEqual( [ 34, 'roi' ], record.values());
			assert.equal( false, record.containsKey("aa"));
			assert.equal( true, record.containsKey("r.name"));
			assert.equal( 2, record.size());
		});
	});
});
