const assert = require("assert"),
	redis = require("redis"),
	Label = require("../src/label"),
	RedisGraph = require("../src/redisGraph").RedisGraph,
	RedisGraphNode = require("../src/redisGraph").Node,
	RedisGraphEdge = require("../src/redisGraph").Edge;

describe('RedisGraphAPI Test', () =>{
	console.log(RedisGraph);
	const api = new RedisGraph("social");
	
	beforeEach( () => {
		return api.deleteGraph().catch(()=>{});
	});

	it("test bring your client", () => {
		return new RedisGraph("social", redis.createClient());
	});

	it("test Create Node", () => {
		// Create a node
		return api.query("CREATE ({name:'roi',age:32})").then(result => {
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
			assert.ok( result.getStatistics().queryExecutionTime()); // not 0
			assert.ok(result.getStatistics().getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME)); // exits   
		});
	});

	it("test Create Labeled Node", () => {
		// Create a node with a label
		return api.query("CREATE (:human{name:'danny',age:12})").then(result => {
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
		let createResult1 = api.query("CREATE (:person{name:'roi',age:32})");
		let createResult2 = api.query("CREATE (:person{name:'amit',age:30})");

		// Connect source and destination nodes.
		return api
			.query(
				"MATCH (a:person), (b:person) WHERE (a.name = 'roi' AND b.name='amit') CREATE (a)-[:knows]->(a)"
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
		return api.query("CREATE (:qhuman{name:'roi',age:32})")
		.then( (create1Result) => {	
			return api.query("CREATE (:qhuman{name:'amit',age:30})");
		})
		.then( (create2Result) => {
			// Connect source and destination nodes.
			return api.query("MATCH (a:qhuman), (b:qhuman) WHERE (a.name = 'roi' AND b.name='amit') CREATE (a)-[:knows]->(b)");
		})
		.then( (connectResult) => {
			// Query
			return api.query("MATCH (a:qhuman)-[knows]->(:qhuman) RETURN a");
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

			assert.deepStrictEqual( [ 'a.age', 'a.name' ], resultSet.getHeader());
			
			let record = resultSet.next();
			assert.equal( "roi", record.getString(1));
			assert.equal( "roi", record.getString("a.name"));
			assert.equal( "32", record.getString(0));
			assert.equal( 32, record.get(0));
			
			assert.deepStrictEqual( [ 'a.age', 'a.name' ], record.keys());
			assert.deepStrictEqual( [ 32, 'roi' ], record.values());
			assert.equal( false, record.containsKey("aa"));
			assert.equal( true, record.containsKey("a.name"));
			assert.equal( 2, record.size());

		});
	});

	//------------- Test cases with Node and Edge class -------------

	it("test Create Node as Object", () => {
		// Create a node
		const node = new RedisGraphNode(null,null,null, properties={
			name: 'roi',
			age: 32
		})

		// Adding node to graph
		api.addNode(node);

		// Commiting the graph
		return api.commit().then(result => {
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
			assert.ok( result.getStatistics().queryExecutionTime()); // not 0
			assert.ok(result.getStatistics().getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME)); // exits   
		});
	});

	it("test Create Labeled Node as Object", () => {
		// Create a node with a label
		const node = new RedisGraphNode(null,null,"human", properties={
			name: 'danny',
			age: 12
		})

		// Adding node to graph
		api.addNode(node);

		return api.commit().then(result => {
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

	it("test Connect Node Objects", () => {
		// Create both source and destination nodes
		const node1 = new RedisGraphNode(null, "a", "person",properties={
			name:'roi',
			age:32}
		);
		// Adding node1 to the graph
		api.addNode(node1);
		const node2 = new RedisGraphNode(null, "b", "person",properties={
			name:'amit',
			age:30}
		);
		// Adding node2 to the graph
		api.addNode(node2);

		const edge = new RedisGraphEdge(node1, "knows", node2);
		// Adding edge to the graph
		api.addEdge(edge);
		// Connect source and destination nodes.

		return api.commit()
			.then(matchResult => {
				assert.ok(!matchResult.hasNext());
				assert.equal(1, matchResult.getStatistics().relationshipsCreated());
				assert.equal(0, matchResult.getStatistics().relationshipsDeleted());
				assert.ok(
					matchResult
						.getStatistics()
						.getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME)
				);
			});
	});
});
