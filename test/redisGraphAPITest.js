const assert = require('assert'),
RedisGraphAPI = require('../src/redisGraphAPI');

describe('RedisGraphAPI Test', () =>{
		const api = new RedisGraphAPI("social"); 

	    beforeEach( () => {
	    	//api.deleteGraph(); - TODO add this back once we implement this API
	  	
//			Method method = RedisGraphAPI.class.getDeclaredMethod("_conn");
//			method.setAccessible(true);
//			((Jedis)method.invoke(api)).flushDB();
	    });
	    
	    it('test Create Node', (done) => {
	        // Create a node    	
	    	api.query("CREATE ({name:'roi',age:32})").then( (result) => {
		    	assert.assertFalse(result.hasNext());
		    	
		    	assert.assertEquals(1, result.getStatistics().nodesCreated());
		    	assert.assertNull(result.getStatistics().getStringValue(Label.NODES_DELETED));
		    	assert.assertNull(result.getStatistics().getStringValue(Label.RELATIONSHIPS_CREATED));
		    	assert.assertNull(result.getStatistics().getStringValue(Label.RELATIONSHIPS_DELETED));
		    	assert.assertEquals(2, result.getStatistics().propertiesSet());
		    	assert.assertNotNull(result.getStatistics().getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME));   
		    	done();
	    	});
	    });

	   it('test Create Labeled Node', (done) => {    	
	        // Create a node with a label
		   let result = api.query("CREATE (:human{name:'danny',age:12})").then( (result) => {
		    	assert.assertFalse(result.hasNext());
		    	
		    	assert.assertEquals("1", result.getStatistics().getStringValue(Label.NODES_CREATED));
		    	assert.assertEquals("2", result.getStatistics().getStringValue(Label.PROPERTIES_SET));
		    	assert.assertNotNull(result.getStatistics().getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME)); 
		    	done();
	    	});
	    });

	   it('test Connect Nodes', (done) => {
	        // Create both source and destination nodes
		   let createResult1 = api.query("CREATE (:person{name:'roi',age:32})");
		   let createResult2 = api.query("CREATE (:person{name:'amit',age:30})");
	    	
	    	// Connect source and destination nodes.
		   let matchResult = api.query("MATCH (a:person), (b:person) WHERE (a.name = 'roi' AND b.name='amit')  CREATE (a)-[knows]->(a)");
	    	
	    	assert.assertFalse(matchResult.hasNext());
	    	assert.assertNull(matchResult.getStatistics().getStringValue(Label.NODES_CREATED));
	    	assert.assertNull(matchResult.getStatistics().getStringValue(Label.PROPERTIES_SET));
	    	assert.assertEquals(1, matchResult.getStatistics().relationshipsCreated());
	    	assert.assertEquals(0, matchResult.getStatistics().relationshipsDeleted());
	    	assert.assertNotNull(matchResult.getStatistics().getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME)); 
	    	done();
	    });

	   it('test Query', (done) => {
	    	
	        // Create both source and destination nodes    	
		   let create1Result = api.query("CREATE (:qhuman{name:'roi',age:32})");
		   let create2Result = api.query("CREATE (:qhuman{name:'amit',age:30})");
	    	
	    	// Connect source and destination nodes.
		   let connectResult= api.query("MATCH (a:qhuman), (b:qhuman) WHERE (a.name = 'roi' AND b.name='amit')  CREATE (a)-[knows]->(b)");

	        // Query
		   let resultSet = api.query("MATCH (a:qhuman)-[knows]->(:qhuman) RETURN a");
	        
	    	assert.assertTrue(resultSet.hasNext());
	    	assert.assertEquals(0, resultSet.getStatistics().nodesCreated());
	    	assert.assertEquals(0, resultSet.getStatistics().propertiesSet());
	    	assert.assertEquals(0, resultSet.getStatistics().relationshipsCreated());
	    	assert.assertEquals(0, resultSet.getStatistics().relationshipsDeleted());
	    	assert.assertNotNull(resultSet.getStatistics().getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME)); 

	    	let record = resultSet.next();
	    	assert.assertEquals( "roi", record.getString(1));
	    	assert.assertEquals( "32.000000", record.getString(0));
	    	
	    });
}) 
