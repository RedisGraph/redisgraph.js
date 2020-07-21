"use strict";
const assert = require("assert"),
	redis = require("redis"),
	Label = require("../src/label"),
	RedisGraph = require("../src/graph"),
	Node = require("../src/node"),
	Edge = require("../src/edge"),
	Path = require("../src/path"),
	PathBuilder = require("./pathBuilder"),
	deepEqual = require("deep-equal");

describe("RedisGraphAPI Test", () => {
	// Assuming this test is running against redis server at: localhost:6379 with no password.
	const api = new RedisGraph("social");

	beforeEach(() => {
		return api.deleteGraph().catch(() => {});
	});

	it("test connection from port and host", async () => {
		// Assuming this test is running against redis server at: localhost:6379 with no password.
		let graph = new RedisGraph("social", "127.0.0.1", 6379, {
			password: undefined,
		});
		let result = await graph.query("CREATE ({name:'roi', age:34})");
		assert.equal(result.size(), 0);
		assert.ok(!result.hasNext());
		assert.equal(1, result.getStatistics().nodesCreated());
		graph.deleteGraph();
		graph.close();
	});

	it("test connection from client", async () => {
		// Assuming this test is running against redis server at: localhost:6379 with no password.
		let graph = new RedisGraph("social", redis.createClient());
		let result = await graph.query("CREATE ({name:'roi', age:34})");
		assert.equal(result.size(), 0);
		assert.ok(!result.hasNext());
		assert.equal(1, result.getStatistics().nodesCreated());
		graph.deleteGraph();
		graph.close();
	});

	it("test Create Node", async () => {
		// Create a node
		let result = await api.query("CREATE ({name:'roi', age:34})");
		assert.equal(result.size(), 0);
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
		assert.ok(
			result
				.getStatistics()
				.getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME)
		); // exsits
		assert.ok(
			result
				.getStatistics()
				.getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME)
		); // exsits
		assert.ok(
			result
				.getStatistics()
				.getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME)
		); // exsits
	});

	it("test Create Labeled Node", async () => {
		// Create a node with a label
		let result = await api.query("CREATE (:human {name:'danny', age:12})");
		assert.equal(result.size(), 0);
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

	it("test Connect Nodes", async () => {
		// Create both source and destination nodes
		await api.query("CREATE (:person {name:'roi', age:34})");
		await api.query("CREATE (:person {name:'amit', age:32})");

		// Connect source and destination nodes.
		let matchResult = await api.query(
			"MATCH (a:person {name:'roi'}), \
        (b:person {name:'amit'}) CREATE (a)-[:knows]->(b)"
		);
		assert.equal(matchResult.size(), 0);
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

	it("test Query", async () => {
		// Create both source and destination nodes
		await api.query(
			"CREATE (r:human {name:'roi', age:34}), (a:human {name:'amit', age:32}), (r)-[:knows]->(a)"
		);
		// Query
		let resultSet = await api.query(
			"MATCH (r:human)-[:knows]->(a:human) RETURN r.age, r.name"
		);
		assert.equal(resultSet.size(), 1);
		assert.ok(resultSet.hasNext());
		assert.equal(0, resultSet.getStatistics().nodesCreated());
		assert.equal(0, resultSet.getStatistics().nodesDeleted());
		assert.equal(0, resultSet.getStatistics().labelsAdded());
		assert.equal(0, resultSet.getStatistics().propertiesSet());
		assert.equal(0, resultSet.getStatistics().relationshipsCreated());
		assert.equal(0, resultSet.getStatistics().relationshipsDeleted());
		assert.ok(
			resultSet
				.getStatistics()
				.getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME)
		);

		assert.deepStrictEqual(["r.age", "r.name"], resultSet.getHeader());

		let record = resultSet.next();
		assert.equal(34, record.get(0));
		assert.equal("34", record.getString(0));
		assert.equal("roi", record.getString(1));
		assert.equal("roi", record.getString("r.name"));

		assert.deepStrictEqual(["r.age", "r.name"], record.keys());
		assert.deepStrictEqual([34, "roi"], record.values());
		assert.equal(false, record.containsKey("aa"));
		assert.equal(true, record.containsKey("r.name"));
		assert.equal(2, record.size());
	});

	it("test query full entity", async () => {
		// Create both source and destination nodes
		await api.query("CREATE (:person {name:'roi', age:34})");
		await api.query("CREATE (:person{name:'amit',age:30})");
		await api.query(
			"MATCH (a:person), (b:person) WHERE (a.name = 'roi' AND b.name='amit') \
        CREATE (a)-[:knows{place:'TLV', since:2000,doubleValue:3.14, boolValue:false, nullValue:null}]->(b)"
		);
		// Query
		let resultSet = await api.query(
			"MATCH (a:person)-[r:knows]->(b:person) RETURN a,r"
		);
		assert.equal(resultSet.size(), 1);
		assert.ok(resultSet.hasNext());
		assert.equal(0, resultSet.getStatistics().nodesCreated());
		assert.equal(0, resultSet.getStatistics().nodesDeleted());
		assert.equal(0, resultSet.getStatistics().labelsAdded());
		assert.equal(0, resultSet.getStatistics().propertiesSet());
		assert.equal(0, resultSet.getStatistics().relationshipsCreated());
		assert.equal(0, resultSet.getStatistics().relationshipsDeleted());
		assert.ok(
			resultSet
				.getStatistics()
				.getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME)
		);

		assert.deepStrictEqual(["a", "r"], resultSet.getHeader());

		let record = resultSet.next();
		let n = record.get(0);
		assert.equal(34, n.properties["age"]);
		assert.equal("roi", n.properties["name"]);
		assert.equal("person", n.label);
		assert.equal(0, n.id);
		var r = record.get(1);
		assert.equal("knows", r.relation);
		assert.equal(0, r.id);
		assert.equal(0, r.srcNode);
		assert.equal(1, r.destNode);
		assert.equal("TLV", r.properties["place"]);
		assert.equal(2000, r.properties["since"]);
		assert.equal(3.14, r.properties["doubleValue"]);
		assert.equal(false, r.properties["boolValue"]);
		assert.equal(undefined, r.properties["nullValue"]);
	});

	it("test null value to string", async () => {
		await api.query("CREATE ( {nullValue:null} )");
		let resultSet = await api.query("MATCH (n) RETURN n.nullValue");
		assert.equal(resultSet.size(), 1);
		assert.ok(resultSet.hasNext());
		let record = resultSet.next();
		assert.equal(undefined, record.get(0));
		assert.equal(null, record.getString(0));
	});

	it("test empty result set", async () => {
		await api.query("CREATE (r:human {name:'roi', age:34})");
		await api.query("CREATE (:person{name:'amit',age:30})");
		await api.query(
			"MATCH (a:person), (b:person) WHERE (a.name = 'roi' AND b.name='amit') \
        CREATE (a)-[:knows]->(a)"
		);

		let resultSet = await api.query(
			"MATCH (a:person)-[:knows]->(:person) RETURN a"
		);

		assert.equal(resultSet.size(), 0);
		assert.ok(!resultSet.hasNext());
		assert.equal(resultSet.getHeader()[0], "a");
		assert.equal(0, resultSet.getStatistics().nodesCreated());
		assert.equal(0, resultSet.getStatistics().nodesDeleted());
		assert.equal(0, resultSet.getStatistics().labelsAdded());
		assert.equal(0, resultSet.getStatistics().propertiesSet());
		assert.equal(0, resultSet.getStatistics().relationshipsCreated());
		assert.equal(0, resultSet.getStatistics().relationshipsDeleted());
		assert.ok(
			resultSet
				.getStatistics()
				.getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME)
		);
	});

	it("test array", async () => {
		await api.query("CREATE (:person{name:'a',age:32,array:[0,1,2]})");
		await api.query("CREATE (:person{name:'b',age:30,array:[3,4,5]})");
		let resultSet = await api.query("WITH [0,1,2] as x return x");

		assert.equal(resultSet.size(), 1);
		assert.ok(resultSet.hasNext());
		assert.deepStrictEqual(["x"], resultSet.getHeader());
		let record = resultSet.next();
		assert.deepStrictEqual([0, 1, 2], record.get(0));
		assert.ok(!resultSet.hasNext());

		let newResultSet = await api.query("MATCH(n) return collect(n) as x");
		assert.equal(newResultSet.size(), 1);
		assert.ok(newResultSet.hasNext());
		var nodeA = new Node("person", {
			name: "a",
			age: 32,
			array: [0, 1, 2],
		});
		nodeA.setId(0);
		var nodeB = new Node("person", {
			name: "b",
			age: 30,
			array: [3, 4, 5],
		});
		nodeB.setId(1);
		assert.deepStrictEqual(["x"], newResultSet.getHeader());
		record = newResultSet.next();
		assert.deepStrictEqual([nodeA, nodeB], record.get(0));
	});

	it("test multi thread", async () => {
		await api.query("CREATE (:person {name:'roi', age:34})");
		var promises = [];
		for (var i = 0; i < 10; i++) {
			promises.push(api.query("MATCH (a:person {name:'roi'}) RETURN a"));
		}
		let values = await Promise.all(promises);
		for (var resultSet of values) {
			assert.equal(resultSet.size(), 1);
			let record = resultSet.next();
			let n = record.get(0);
			assert.equal(34, n.properties["age"]);
			assert.equal("roi", n.properties["name"]);
			assert.equal("person", n.label);
			assert.equal(0, n.id);
		}
	});

	it("testCompileTimeException", async () => {
		await api.query("CREATE ()");
		try {
			await api.query("RETURN toUpper(5)");
			assert(false);
		} catch (err) {
			assert(err instanceof redis.ReplyError);
			assert.equal(
				err.message,
				"Type mismatch: expected String but was Integer"
			);
		}
	});

	it("testRuntimeException", async () => {
		await api.query("CREATE ({val:5})");
		try {
			await api.query("MATCH (n) RETURN toUpper(n.val)");
			assert(false);
		} catch (err) {
			assert(err instanceof redis.ReplyError);
			assert.equal(
				err.message,
				"Type mismatch: expected String but was Integer"
			);
		}
	});

	it("unitTestPath", () => {
		let nodcachedExecutione0 = new Node("L1", {});
		node0.setId(0);
		let node1 = new Node("L1", {});
		node1.setId(1);

		let edge01 = new Edge(0, "R1", 1, {});
		edge01.setId(0);

		let path01 = new PathBuilder()
			.append(node0)
			.append(edge01)
			.append(node1)
			.build();

		assert.equal(1, path01.edgeCount);
		assert.equal(2, path01.nodeCount);
		assert.deepEqual(node0, path01.firstNode);
		assert.deepEqual(node0, path01.getNode(0));
		assert.deepEqual(node1, path01.lastNode);
		assert.deepEqual(node1, path01.getNode(1));
		assert.deepEqual(edge01, path01.getEdge(0));
		assert.deepEqual([node0, node1], path01.nodes);
		assert.deepEqual([edge01], path01.edges);
	});

	it("testPath", async () => {
		await api.query("CREATE (:L1)-[:R1]->(:L1)-[:R1]->(:L1)");
		let response = await api.query(
			"MATCH p = (:L1)-[:R1*]->(:L1) RETURN p"
		);
		let node0 = new Node("L1", {});
		node0.setId(0);
		let node1 = new Node("L1", {});
		node1.setId(1);
		let node2 = new Node("L1", {});
		node2.setId(2);
		let edge01 = new Edge(0, "R1", 1, {});
		edge01.setId(0);
		let edge12 = new Edge(1, "R1", 2, {});
		edge12.setId(1);

		let path01 = new PathBuilder()
			.append(node0)
			.append(edge01)
			.append(node1)
			.build();
		let path12 = new PathBuilder()
			.append(node1)
			.append(edge12)
			.append(node2)
			.build();
		let path02 = new PathBuilder()
			.append(node0)
			.append(edge01)
			.append(node1)
			.append(edge12)
			.append(node2)
			.build();

		let paths = new Set([path01, path12, path02]);
		assert.equal(response.size(), 3);
		while (response.hasNext()) {
			let p = response.next().get("p");
			let pInPaths = false;
			let path = null;
			let pathsIterator = paths.values();
			for (pathsIterator; (path = pathsIterator.next().value); ) {
				if (deepEqual(p, path)) {
					pInPaths = true;
					break;
				}
			}
			assert(pInPaths);
			paths.delete(path);
		}
		assert.equal(0, paths.size);
	});

	it("testParam", async () => {
		let params = [
			1,
			2.3,
			true,
			false,
			null,
			"str",
			[1, 2, 3],
			["1", "2", "3"],
			null,
			'test"abc'
		];
		let promises = [];
		for (var i = 0; i < params.length; i++) {
			let param = { param: params[i] };
			promises.push(api.query("RETURN $param", param));
		}
		let values = await Promise.all(promises);
		for (var i = 0; i < values.length; i++) {
			let resultSet = values[i];
			let record = resultSet.next();
			let param = record.get(0);
			assert.deepEqual(param, params[i]);
		}
	});

	it("testMissingParameter", async () => {
		try {
			await api.query("RETURN $param");
			assert(false);
		} catch (err) {
			assert(err instanceof redis.ReplyError);
			assert.equal(err.message, "Missing parameters");
		}
	});

	it("testIndexResponse", async () => {
		let response = await api.query("CREATE INDEX ON :person(age)");
		assert.equal(1, response.getStatistics().indicesCreated());
		response = await api.query("CREATE INDEX ON :person(age)");
		assert.equal(0, response.getStatistics().indicesCreated());
		response = await api.query("DROP INDEX ON :person(age)");
		assert.equal(1, response.getStatistics().indicesDeleted());
		try {
			await api.query("DROP INDEX ON :person(age)");
			assert(false);
		} catch (err) {
			assert(err instanceof redis.ReplyError);
			assert.equal(
				err.message,
				"ERR Unable to drop index on :person(age): no such index."
			);
		}
	});

	it("testOptionalMatch", async () => {
		await api.query("CREATE (:L {val:1})-[:E {val:2}]->(:L2 {val: 3})");
		let resultSet = await api.query(
			"OPTIONAL MATCH (a:NONEXISTENT)-[e]->(b) RETURN a.val, e.val, b.val"
		);
		assert.equal(resultSet.size(), 1);
		assert.ok(resultSet.hasNext());
		let record = resultSet.next();
		assert.ok(!resultSet.hasNext());
		assert.deepEqual(record.values(), [null, null, null]);

		// Test a query that produces 2 records, with 2 null values in the second.
		resultSet = await api.query(
			"MATCH (a) OPTIONAL MATCH (a)-[e]->(b) RETURN a.val, e.val, b.val ORDER BY ID(a)"
		);
		assert.equal(resultSet.size(), 2);
		record = resultSet.next();
		assert.equal(record.size(), 3);
		assert.equal(record.get(0), 1);
		assert.equal(record.get(1), 2);
		assert.equal(record.get(2), 3);
		record = resultSet.next();
		assert.equal(record.size(), 3);
		assert.equal(record.get(0), 3);
		assert.equal(record.get(1), null);
		assert.equal(record.get(2), null);

        // Test a query that produces 2 records, the first containing a path and the second containing a null value
        let node0 = new Node("L", {val:1});
		node0.setId(0);
		let node1 = new Node("L2", {val:3});
		node1.setId(1);
		let edge01 = new Edge(0, "E", 1, {val:2});
		edge01.setId(0);
        let expectedPath = new PathBuilder()
			.append(node0)
			.append(edge01)
			.append(node1)
            .build();
            
		resultSet = await api.query(
			"MATCH (a) OPTIONAL MATCH p = (a)-[e]->(b) RETURN p"
        );
        
		assert.equal(resultSet.size(), 2);
		record = resultSet.next();
		assert.equal(record.size(), 1);
		assert.deepEqual(record.get(0), expectedPath);
		record = resultSet.next();
		assert.equal(record.size(), 1);
		assert.equal(record.get(0), null);
    });
    
    it("testCachedExecution", async () => {
        await api.query("CREATE (:N {val:1}), (:N {val:2})");
	    
        // First time should not be loaded from execution cache
        let resultSet = await api.query(
	        "MATCH (n:N {val:$val}) RETURN n.val ", {'val':1}
        );
        assert.equal(resultSet.size(), 1)
        assert.equal(false, resultSet.getStatistics().cachedExecution())

        let record = resultSet.next();
        assert.equal(record.size(), 1);
        assert.equal(record.get(0), 1);
        
	// Run in loop many times to make sure the query will be loaded
	// from cache at least once
        for (var i = 0; i < 64; i++) {
            resultSet = await api.query(
                "MATCH (n:N {val:$val}) RETURN n.val ", {'val':1}
            );
        }	
        assert.equal(resultSet.size(), 1)
        record = resultSet.next();
        assert.equal(record.size(), 1);
        assert.equal(record.get(0), 1);
        assert.equal(true, resultSet.getStatistics().cachedExecution())
    });
});
