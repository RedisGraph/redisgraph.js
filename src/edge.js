/**
 * An edge connecting two nodes.
 */
class Edge {
    constructor(srcNode, relation, destNode, edgeId, properties) {        
        this.id = edgeId;
        this.relation = relation;
        this.properties = properties;
        this.srcNode = srcNode;
        this.destNode = destNode;
    }

    toString() {
        let res = "";
        let props = "";

        for(var i = 0; i < this.properties.length; i++) {
            for (var entry of map.entries()) {
                let key = entry[0];
                let value = entry[1];
                props += key + ':' + String(val) + ',';
            }
            res += '{' + props + '}';
        }
        return res;
    }
}

module.exports = Edge;
