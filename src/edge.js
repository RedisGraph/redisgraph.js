/**
 * An edge connecting two nodes.
 */
class Edge {
    constructor(src_node, relation, dest_node, edge_id, properties) {        
        this.id = edge_id;
        this.relation = relation;
        this.properties = properties;
        this.src_node = src_node;
        this.dest_node = dest_node;
    }

    toString() {
        let res = "";
        let props = "";

        for(var i = 0; i < this.properties.length; i++) {
            let prop = this.properties[i];
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
