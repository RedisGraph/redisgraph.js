const RedisGraph = require("redisgraph.js").Graph;

let graph = new RedisGraph("social");

graph.query("CREATE (:person{name:'roi',age:32})").then(() => {
		graph.query("CREATE (:person{name:'amit',age:30})").then(()=>{
            graph.query("MATCH (a:person), (b:person) WHERE (a.name = 'roi' AND b.name='amit') CREATE (a)-[:knows]->(b)").then(()=>{
                graph.query("MATCH (a:person)-[:knows]->(:person) RETURN a.name").then(res=>{
                    while (res.hasNext()) {
                        let record = res.next();
                        console.log(record.get("a.name"));
                    }
                    console.log(res.getStatistics().queryExecutionTime());
                    graph.query("MATCH p = (a:person)-[:knows]->(:person) RETURN p").then(res=>{
                        while (res.hasNext()) {
                            let record = res.next();
                            // See path.js for more path API.
                            console.log(record.get("p").nodeCount);
                            graph.deleteGraph();
                            process.exit();
                        }
                    })
                })
            })
        })
	})
	.catch(err => {
		console.log(err);
	});
