const RedisGraph = require("redisgraph.js").Graph;

let graph = new RedisGraph("social");

try {
    (async () =>{
        await graph.query("CREATE (:person{name:'roi',age:32})");
        await graph.query("CREATE (:person{name:'amit',age:30})");
        await graph.query("MATCH (a:person), (b:person) WHERE (a.name = 'roi' AND b.name='amit') CREATE (a)-[:knows]->(b)");
        
        // Match query.
        let res = await graph.query("MATCH (a:person)-[:knows]->(:person) RETURN a.name");
        while (res.hasNext()) {
            let record = res.next();
            console.log(record.get("a.name"));
        }
        console.log(res.getStatistics().queryExecutionTime());
    
        // Match with parameters.
        let param = {'age': 30};
        res = await graph.query("MATCH (a {age: $age}) return a.name", param);
        while (res.hasNext()) {
            let record = res.next();
            console.log(record.get("a.name"));
        }
    
        // Named paths matching.
        res = await graph.query("MATCH p = (a:person)-[:knows]->(:person) RETURN p");
        while (res.hasNext()) {
            let record = res.next();
            // See path.js for more path API.
            console.log(record.get("p").nodeCount);
            graph.deleteGraph();
            process.exit();
        }
    
    })();
}
catch(err){
    console.log(err);
}
