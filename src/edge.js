/**
 * An edge connecting two nodes.
 */
class Edge {
    constructor(srcNode, relation, destNode, properties) {
        this.id = undefined;
        this.relation = relation;
        this.srcNode = srcNode;
        this.destNode = destNode;
        this.properties = properties;
    }

    setId(id) {
        this.id = id;
    }
    toString() {
        return JSON.stringify(this);
    }
}

module.exports = Edge;
