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

### Install official release
```bash
npm install redisgraph.js
```

### Install latest version (Alligned with RedisGraph master branch)

```bash
npm install git+https://github.com/RedisGraph/redisgraph.js.git
```

## Overview

### Official Releases


# Example: Using the JavaScript Client

```javascript
const RedisGraph = require("redisgraph.js").RedisGraph;

let graph = new RedisGraph('social');
graph
.query("CREATE (:person{name:'roi',age:32})")
.then( () => {
	return graph.query("CREATE (:person{name:'amit',age:30})");
})
.then( () => {
	return graph.query("MATCH (a:person), (b:person) WHERE (a.name = 'roi' AND b.name='amit') CREATE (a)-[:knows]->(b)")
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
