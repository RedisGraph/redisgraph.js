[![license](https://img.shields.io/github/license/RedisGraph/redisgraph.js.svg)](https://github.com/RedisGraph/redisgraph.js)
[![GitHub issues](https://img.shields.io/github/release/RedisGraph/redisgraph.js.svg)](https://github.com/RedisGraph/redisgraph.js/releases/latest)
[![npm version](https://badge.fury.io/js/redisgraph.js.svg)](https://badge.fury.io/js/redisgraph.js)
[![Codecov](https://codecov.io/gh/RedisGraph/redisgraph.js/branch/master/graph/badge.svg)](https://codecov.io/gh/RedisGraph/redisgraph.js)
[![Known Vulnerabilities](https://snyk.io/test/github/RedisGraph/redisgraph.js/badge.svg?targetFile=package.json)](https://snyk.io/test/github/RedisGraph/redisgraph.js?targetFile=package.json)



# redisgraph.js
[![Forum](https://img.shields.io/badge/Forum-RedisGraph-blue)](https://forum.redislabs.com/c/modules/redisgraph)
[![Discord](https://img.shields.io/discord/697882427875393627?style=flat-square)](https://discord.gg/gWBRT6P)

[RedisGraph](https://github.com/RedisLabsModules/redis-graph/) JavaScript Client - [API Docs](https://redisgraph.github.io/redisgraph.js/)

-------
## Deprecation notice
This library is deprecated. [node-redis](https://www.github.com/redis/node-redis). It's features have been merged into [node-redis](https://www.github.com/redis/node-redis). Please either install it from npm or the repository.
-----

## Installation

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
npm install redisgraph.js
```

For installing the latest snapshot use
```bash
npm install github:RedisGraph/redisgraph.js.git
```


## Overview

### Example: Using the JavaScript Client

```javascript
const RedisGraph = require("redisgraph.js").Graph;

let graph = new RedisGraph("social");

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
        }
        graph.deleteGraph();
        graph.close();

    })();

```

### Running tests

A simple test suite is provided, and can be run with:

```sh
$ npm test
```

The tests expect a Redis server with the RedisGraph module loaded to be available at localhost:6379

## License

redisgraph.js is distributed under the BSD3 license - see [LICENSE](LICENSE)

[npm-image]: https://img.shields.io/npm/v/express.svg
[npm-url]: https://npmjs.org/package/redisgraph.js
