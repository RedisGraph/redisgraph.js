[![license](https://img.shields.io/github/license/RedisGraph/redisgraph.js.svg)](https://github.com/RedisGraph/redisgraph.js)
[![CircleCI](https://circleci.com/gh/RedisGraph/redisgraph.js/tree/master.svg?style=svg)](https://circleci.com/gh/RedisGraph/redisgraph.js/tree/master)
[![GitHub issues](https://img.shields.io/github/release/RedisGraph/redisgraph.js.svg)](https://github.com/RedisGraph/redisgraph.js/releases/latest)
[![npm version](https://badge.fury.io/js/redisgraph.js.svg)](https://badge.fury.io/js/redisgraph.js)
[![GitHub issues](https://img.shields.io/github/release/RedisGraph/redisgraph.js.svg)](https://github.com/RedisGraph/redisgraph.js/releases/latest)
[![Codecov](https://codecov.io/gh/RedisGraph/redisgraph.js/branch/master/graph/badge.svg)](https://codecov.io/gh/RedisGraph/redisgraph.js)

# redisgraph.js

[RedisGraph](https://github.com/RedisLabsModules/redis-graph/) JavaScript Client


# Installation

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
npm install redisgraph.js
```

## Overview

### Official Releases


# Example: Using the JavaScript Client

```javascript
const RedisGraph = require("redisgraph.js").RedisGraph;

let graph = new RedisGraph.RedisGraph('social');
graph
.query("CREATE (:person{name:'roi',age:32})")
.then( () => {
	return graph.query("CREATE (:person{name:'amit',age:30})");
})
.then( () => {
	return graph.query("MATCH (a:person), (b:person) WHERE (a.name = 'roi' AND b.name='amit') CREATE (a)-[:knows]->(a)")
})
.then( () => {
	return graph.query("MATCH (a:person)-[:knows]->(:person) RETURN a")
})
.then( (res) => {
	while(res.hasNext()){
		let record = res.next();
		console.log(record.getString('a.name'));
	}
	console.log(res.getStatistics().queryExecutionTime());
});

```

# Example2: Using the Node and Edge classes

```javascript
const RedisGraph = require("redisgraph.js").RedisGraph;
const RedisGraphNode = RedisGraph.RedisGraphNode;
const RedisGraphNode = RedisGraph.RedisGraphNode;


let graph = new RedisGraph.RedisGraph('social');
// Create both source and destination nodes
const node1 = new RedisGraphNode(null, "a", "person",properties={
	name:'roi',
	age:32}
);
// Adding node1 to the graph
graph.addNode(node1);
const node2 = new RedisGraphNode(null, "b", "person",properties={
	name:'amit',
	age:30}
);
// Adding node2 to the graph
graph.addNode(node2);

const edge = new RedisGraphEdge(node1, "knows", node2);
// Adding edge to the graph
graph.addEdge(edge);
// Connect source and destination nodes.
graph
.commit()
.then( () => {
	return graph.query("MATCH (a:person)-[:knows]->(:person) RETURN a")
})
.then( (res) => {
	while(res.hasNext()){
		let record = res.next();
		console.log(record.getString('a.name'));
	}
	console.log(res.getStatistics().queryExecutionTime());
});

```

## Running tests

A simple test suite is provided, and can be run with:

```sh
$ npm test
```

The tests expect a Redis server with the RedisGraph module loaded to be available at localhost:6379

## License

redisgraph.js is distributed under the BSD3 license - see [LICENSE](LICENSE)

[npm-image]: https://img.shields.io/npm/v/express.svg
[npm-url]: https://npmjs.org/package/redisgraph.js
