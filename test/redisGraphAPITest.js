const assert = require("assert"),
    redis = require("redis"),
    Label = require("../src/label"),
    RedisGraph = require("../src/graph");
    PathBuilder = require("./pathBuilder");
    deepEqual = require('deep-equal');

describe('RedisGraphAPI Test', function () {
    const api = new RedisGraph("social");

    beforeEach(() => {
        return api.deleteGraph().catch(() => { });
    });

    it("test bring your client", () => {
        return new RedisGraph("social", redis.createClient());
    });

    it("test Create Node", (done) => {
        // Create a node
        api.query("CREATE ({name:'roi', age:34})").then(result => {
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
            done();
        }).catch(error => {
            console.log(error);
        })
    });

    it("test Create Labeled Node", (done) => {
        // Create a node with a label
        api.query("CREATE (:human {name:'danny', age:12})").then(result => {
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
            done();
        }).catch(error => {
            console.log(error);
        })
    });

    it("test Connect Nodes", (done) => {
        // Create both source and destination nodes
        let createResult1 = api.query("CREATE (:person {name:'roi', age:34})");
        let createResult2 = api.query("CREATE (:person {name:'amit', age:32})");

        // Connect source and destination nodes.
        api.query(
            "MATCH (a:person {name:'roi'}), (b:person {name:'amit'}) CREATE (a)-[:knows]->(b)"
        ).then(matchResult => {
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
            done();
        }).catch(error => {
            console.log(error);
        })
    });

    it('test Query', (done) => {
        // Create both source and destination nodes    	
        api.query("CREATE (r:human {name:'roi', age:34}), (a:human {name:'amit', age:32}), (r)-[:knows]->(a)")
            .then((createResult) => {
                // Query
                api.query("MATCH (r:human)-[:knows]->(a:human) RETURN r.age, r.name")
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
                        done()
                    })
            }).catch(error => {
                console.log(error);
            })

    });

    it('test query full entity', (done) => {
        // Create both source and destination nodes
        api.query("CREATE (:person {name:'roi', age:34})").then(response => {
            api.query("CREATE (:person{name:'amit',age:30})").then(response2 => {
                api.query("MATCH (a:person), (b:person) WHERE (a.name = 'roi' AND b.name='amit')  " +
                    "CREATE (a)-[:knows{place:'TLV', since:2000,doubleValue:3.14, boolValue:false, nullValue:null}]->(b)")
                    .then((createResult) => {
                        // Query
                        api.query("MATCH (a:person)-[r:knows]->(b:person) RETURN a,r")

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
                                done();
                            })
                    })
            })
        }).catch(error => {
            console.log(error);
        })
    })

    it('test null value to string', (done) => {
        api.query("CREATE ( {nullValue:null} )").then(response => {
            api.query("MATCH (n) RETURN n.nullValue").then(resultSet => {
                assert.ok(resultSet.hasNext())
                let record = resultSet.next();
                assert.equal(undefined, record.get(0));
                assert.equal(null, record.getString(0))
                done();
            })
        }).catch(error => {
            console.log(error);
        })
    })

    it('test empty result set', (done) => {
        api.query("CREATE (r:human {name:'roi', age:34})").
            then(response => {
                api.query("CREATE (:person{name:'amit',age:30})")
                    .then(response => {
                        api.query("MATCH (a:person), (b:person) WHERE (a.name = 'roi' AND b.name='amit') CREATE (a)-[:knows]->(a)")
                            .then(response2 => {
                                api.query("MATCH (a:person)-[:knows]->(:person) RETURN a")
                                    .then(resultSet => {
                                        assert.ok(!resultSet.hasNext());
                                        assert.equal(resultSet.getHeader()[0], 'a');
                                        assert.equal(0, resultSet.getStatistics().nodesCreated());
                                        assert.equal(0, resultSet.getStatistics().nodesDeleted());
                                        assert.equal(0, resultSet.getStatistics().labelsAdded());
                                        assert.equal(0, resultSet.getStatistics().propertiesSet());
                                        assert.equal(0, resultSet.getStatistics().relationshipsCreated());
                                        assert.equal(0, resultSet.getStatistics().relationshipsDeleted());
                                        assert.ok(resultSet.getStatistics().getStringValue(Label.QUERY_INTERNAL_EXECUTION_TIME));
                                        done();
                                    })
                            })
                    })
            }).catch(error => {
                console.log(error);
            })
    })

    it('test array', (done) => {
        api.query("CREATE (:person{name:'a',age:32,array:[0,1,2]})").then(() => {
            api.query("CREATE (:person{name:'b',age:30,array:[3,4,5]})").then(() => {
                api.query("WITH [0,1,2] as x return x").then(resultSet => {
                    assert.ok(resultSet.hasNext());
                    assert.deepStrictEqual(['x'], resultSet.getHeader());
                    let record = resultSet.next();
                    assert.deepStrictEqual([0, 1, 2], record.get(0));
                    assert.ok(!resultSet.hasNext());

                    api.query("MATCH(n) return collect(n) as x").then(newResultSet => {
                        assert.ok(newResultSet.hasNext());
                        var nodeA = new Node("person", { name: 'a', age: 32, array: [0, 1, 2] });
                        nodeA.setId(0);
                        var nodeB = new Node("person", { name: 'b', age: 30, array: [3, 4, 5] });
                        nodeB.setId(1);
                        assert.deepStrictEqual(['x'], newResultSet.getHeader());
                        let record = newResultSet.next();
                        assert.deepStrictEqual([nodeA, nodeB], record.get(0));
                        done();
                    })
                })
            })
        }).catch(error => {
            console.log(error);
        })
    })

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
            })
        }).catch(error => {
            console.log(error);
        })
    })

    it('testCompileTimeException', (done) => {
        api.query("CREATE ()").then(response => {
            api.query("RETURN toUpper(5)").then(response => assert(false)).catch (err => {
                assert(err instanceof redis.ReplyError);
                assert.equal(err.message, "Type mismatch: expected String but was Integer");
                done();
            })
        }).catch(error => {
            console.log(error);
        })
    })

    it('testRuntimeException', (done) => {
        api.query("CREATE ({val:5})").then(response => {
            api.query("MATCH (n) RETURN toUpper(n.val)").then(response => assert(false)).catch (err => {
                assert(err instanceof redis.ReplyError);
                assert.equal(err.message, "Type mismatch: expected String but was Integer");
                done();
            })
        }).catch(error => {
            console.log(error);
        })
    })

    it('testPath', (done)=>{
        api.query("CREATE (:L1)-[:R1]->(:L1)-[:R1]->(:L1)").then(response => {
            api.query("MATCH p = (:L1)-[:R1*]->(:L1) RETURN p").then(response =>{
                let node0 = new Node("L1", {});
                node0.setId(0);
                let node1 = new Node("L1", {});
                node1.setId(1);
                let node2 = new Node("L1", {});
                node2.setId(2);
                let edge01 = new Edge(0, "R1", 1, {});
                edge01.setId(0);
                let edge12 = new Edge(1, "R1", 2, {});
                edge12.setId(1);

                let path01 = new PathBuilder().append(node0).append(edge01).append(node1).build();
                let path12 = new PathBuilder().append(node1).append(edge12).append(node2).build();
                let path02 = new PathBuilder().append(node0).append(edge01).append(node1).append(edge12).append(node2).build();

                let paths = new Set([path01, path12, path02]);
                while(response.hasNext()){
                    let p = response.next().get("p");
                    let pInPaths = false;
                    let path = null;
                    for( pathsIterator = paths.values(); path = pathsIterator.next().value;){
                        if(deepEqual(p ,path)){
                            pInPaths = true;
                            break;
                        }
                    }
                   assert(pInPaths);
                   paths.delete(path);
                }
                assert.equal(0, paths.size);
                done();
            })
        }).catch(error => {
            console.log(error);
        })
    })

});
