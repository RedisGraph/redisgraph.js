const assert = require('assert'),
redis = require('redis'),
Label = require('../src/statistics').Label,
RedisGraphAPI = require('../src/redisGraph');

describe('RedisGraphAPI Test', () =>{
	const api = new RedisGraphAPI("social");
	
	beforeEach( () => {
		return api.deleteGraph().catch(()=>{});
	});

	it('test bring your client', () => {
		return new RedisGraphAPI( "social", redis.createClient());
	});
	
	it('test Create Node', () => {
		// Create a node    	
		return api.query("CREATE ({name:'roi',age:32})")
		.then( (result) => {
			assert.ok(!result.hasNext());		    	
			assert.equal(1, result.getStatistics().nodesCreated());
			assert.ifError(result.getStatistics().getStringValue(Label.NODES_DELETED));
			assert.ifError(result.getStatistics().getStringValue(Label.RELATIONSHIPS_CREATED));
			assert.ifError(result.getStatistics().getStringValue(Label.RELATIONSHIPS_DELETED));
			assert.equal(2, result.getStatistics().propertiesSet());
			assert.ok(result.getStatistics().getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME));   
		});
	});

	it('test Create Labeled Node', () => {    	
		// Create a node with a label
		return api.query("CREATE (:human{name:'danny',age:12})")
		.then( (result) => {
			assert.ok(!result.hasNext());
			assert.equal("1", result.getStatistics().getStringValue(Label.NODES_CREATED));
			assert.equal("2", result.getStatistics().getStringValue(Label.PROPERTIES_SET));
			assert.ok(result.getStatistics().getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME)); 
		});
	});

	it('test Connect Nodes', () => {
		// Create both source and destination nodes
		let createResult1 = api.query("CREATE (:person{name:'roi',age:32})");
		let createResult2 = api.query("CREATE (:person{name:'amit',age:30})");

		// Connect source and destination nodes.
		return api.query("MATCH (a:person), (b:person) WHERE (a.name = 'roi' AND b.name='amit') CREATE (a)-[:knows]->(a)")
		.then( (matchResult) => {
			assert.ok(!matchResult.hasNext());
			assert.ifError(matchResult.getStatistics().getStringValue(Label.NODES_CREATED));
			assert.ifError(matchResult.getStatistics().getStringValue(Label.PROPERTIES_SET));
			assert.equal(1, matchResult.getStatistics().relationshipsCreated());
			assert.equal(0, matchResult.getStatistics().relationshipsDeleted());
			assert.ok(matchResult.getStatistics().getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME)); 
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
			assert.equal(0, resultSet.getStatistics().propertiesSet());
			assert.equal(0, resultSet.getStatistics().relationshipsCreated());
			assert.equal(0, resultSet.getStatistics().relationshipsDeleted());
			assert.ok(resultSet.getStatistics().getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME)); 

			let record = resultSet.next();
			assert.equal( "roi", record.getString(1));
			assert.equal( "32.000000", record.getString(0));
		});
	});
});
