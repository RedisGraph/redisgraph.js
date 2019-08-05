const RedisGraph = require("redisgraph.js").RedisGraph;

let graph = new RedisGraph("social");

graph
    .query("CREATE (:person{name:'roi',age:32})")
    .then(() => {
        return graph.query("CREATE (:person{name:'amit',age:30})");
    })
    .then(() => {
        return graph.query(
            "MATCH (a:person), (b:person) WHERE (a.name = 'roi' AND b.name='amit') CREATE (a)-[:knows]->(b)"
        );
    })
    .then(() => {
        return graph.query("MATCH (a:person)-[:knows]->(:person) RETURN a");
    })
    .then(res => {
        while (res.hasNext()) {
            let record = res.next();
            console.log(record.getString("a.name"));
        }
        console.log(res.getStatistics().queryExecutionTime());
    })
    .catch(err => {
        console.log(err);
    });
