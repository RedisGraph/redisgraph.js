const assert = require("assert"),
    redis = require("redis"),
    Label = require("../src/label"),
    RedisGraph = require("../src/graph");

describe('RedisGraphAPI Test', () => {
    const api = new RedisGraph("social");

    beforeEach(() => {
        return api.deleteGraph().catch(() => { });
    });

    it("test bring your client", () => {
        return new RedisGraph("social", redis.createClient());
    });

    it("test Create Node", () => {
        // Create a node
        return api.query("CREATE ({name:'roi', age:34})").then(result => {
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
            assert.ok(result.getStatistics().getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME)); // exsits   
        });
    });

    it("test Create Labeled Node", () => {
        // Create a node with a label
        return api.query("CREATE (:human {name:'danny', age:12})").then(result => {
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
    });

    it("test Connect Nodes", () => {
        // Create both source and destination nodes
        let createResult1 = api.query("CREATE (:person {name:'roi', age:34})");
        let createResult2 = api.query("CREATE (:person {name:'amit', age:32})");

        // Connect source and destination nodes.
        return api
            .query(
                "MATCH (a:person {name:'roi'}), (b:person {name:'amit'}) CREATE (a)-[:knows]->(b)"
            )
            .then(matchResult => {
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
    });

    it('test Query', () => {
        // Create both source and destination nodes    	
        return api.query("CREATE (r:human {name:'roi', age:34}), (a:human {name:'amit', age:32}), (r)-[:knows]->(a)")
            .then((createResult) => {
                // Query
                return api.query("MATCH (r:human)-[:knows]->(a:human) RETURN r.age, r.name");
            })
            .then((resultSet) => {
                assert.ok(resultSet.hasNext());
                assert.equal(0, resultSet.getStatistics().nodesCreated());
                assert.equal(0, resultSet.getStatistics().nodesDeleted());
                assert.equal(0, resultSet.getStatistics().labelsAdded());
                assert.equal(0, resultSet.getStatistics().propertiesSet());
                assert.equal(0, resultSet.getStatistics().relationshipsCreated());
                assert.equal(0, resultSet.getStatistics().relationshipsDeleted());
                assert.ok(resultSet.getStatistics().getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME));

                assert.deepStrictEqual(['r.age', 'r.name'], resultSet.getHeader());

                let record = resultSet.next();
                assert.equal(34, record.get(0));
                assert.equal("34", record.getString(0));
                assert.equal("roi", record.getString(1));
                assert.equal("roi", record.getString("r.name"));

                assert.deepStrictEqual(['r.age', 'r.name'], record.keys());
                assert.deepStrictEqual([34, 'roi'], record.values());
                assert.equal(false, record.containsKey("aa"));
                assert.equal(true, record.containsKey("r.name"));
                assert.equal(2, record.size());
            });
    });

    it('test query full entity', () => {
        // Create both source and destination nodes
        return api.query("CREATE (:person {name:'roi', age:34})").then(response => {
            api.query("CREATE (:person{name:'amit',age:30})")
        })
            .then(response2 => {
                api.query("MATCH (a:person), (b:person) WHERE (a.name = 'roi' AND b.name='amit')  " +
                    "CREATE (a)-[:knows{place:'TLV', since:2000,doubleValue:3.14, boolValue:false, nullValue:null}]->(b)")
            })

            .then((createResult) => {
                // Query
                return api.query("MATCH (a:person)-[r:knows]->(b:person) RETURN a,r");
            })
            .then((resultSet) => {
                assert.ok(resultSet.hasNext());
                assert.equal(0, resultSet.getStatistics().nodesCreated());
                assert.equal(0, resultSet.getStatistics().nodesDeleted());
                assert.equal(0, resultSet.getStatistics().labelsAdded());
                assert.equal(0, resultSet.getStatistics().propertiesSet());
                assert.equal(0, resultSet.getStatistics().relationshipsCreated());
                assert.equal(0, resultSet.getStatistics().relationshipsDeleted());
                assert.ok(resultSet.getStatistics().getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME));

                assert.deepStrictEqual(['a', 'r'], resultSet.getHeader());

                let record = resultSet.next();
                let n = record.get(0);
                assert.equal(34, n.properties['age']);
                assert.equal("roi", n.properties['name']);
                assert.equal("person", n.label);
                assert.equal(0, n.id);
                console.log(n.toString());
                var r = record.get(1);
                assert.equal("knows", r.relation);
                assert.equal(0, r.id);
                assert.equal(0, r.srcNode);
                assert.equal(1, r.destNode);
                assert.equal("TLV", r.properties['place']);
                assert.equal(2000, r.properties["since"]);
                assert.equal(3.14, r.properties["doubleValue"]);
                assert.equal(false, r.properties["boolValue"]);
                assert.equal(undefined, r.properties["nullValue"]);
                console.log(r.toString());
            });
    });

    it('test multi thread', (done) => {
        api.query("CREATE (:person {name:'roi', age:34})").then(response => {
            var promises = []
            for (var i = 0; i < 10; i++) {
                promises.push(api.query("MATCH (a:person {name:'roi'}) RETURN a"));
            }
            Promise.all(promises).then(values => {
                for (var resultSet of values) {
                    let record = resultSet.next();
                    let n = record.get(0);
                    assert.equal(34, n.properties['age']);
                    assert.equal("roi", n.properties['name']);
                    assert.equal("person", n.label);
                    assert.equal(0, n.id);
                }
                done();
            });
        });
    });

    it('test error reporting', (done) => {
        api.query("CREATE ()").then(response => {
            api.query("RETURN abs('q')")
                .then(values => { assert.fail("Expecting an error"); })
                .catch(e => {
                    assert.equal(e.message, "Type mismatch: expected Integer but was String ");
                    done();
                });
        })

    });

});
