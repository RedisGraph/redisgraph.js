/**
 * A node within the garph.
 */
class Node {
    constructor(label, properties) {
        this.id = undefined;
        this.label = label;
        this.properties = properties;
    }

    setId(id){
        this.id = id;
    }

    toString() {
        return JSON.stringify(this);
    }
}

module.exports = Node;
