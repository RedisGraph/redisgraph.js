const RedisGraph = require('../src/redisGraph');


let graph = new RedisGraph('social');

graph.query("CREATE (:person{name:'roi',age:32})").then( (res) => {
	console.log('@1111')
	console.log(res);
});
graph.query("CREATE (:person{name:'amit',age:30})").then( (res) => {
	console.log(res);
	console.log("AAA " + res.getStatistics().nodesCreated());
});

graph.query("MATCH (a:person), (b:person) WHERE (a.name = 'roi' AND b.name='amit') CREATE (a)-[knows]->(a)").then( (res) => {
	console.log('@33333')
	console.log(res);
});
//
graph.query("MATCH (a:person)-[knows]->(:person) RETURN a").then( (res) => {
	console.log(res);
	console.log("AAA " + res.getStatistics().nodesCreated());
});
//
//while(resultSet.hasNext()){
//	Record record = resultSet.next();
//	System.out.println(record.getString("a.name"));
//}
