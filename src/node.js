/**
 * A node within the garph.
 */
class Node {
    constructor(label, properties) {
        this.id = undefined;                //node's id - set by RedisGraph
        this.label = label;                 //node's label
        this.properties = properties;       //node's list of properties (list of Key:Value)
    }

    setId(id){
        this.id = id;
    }

    toString() {
        return JSON.stringify(this);
    }
}

module.exports = Node;
