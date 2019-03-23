/**
 * A node within the garph.
 */
class Node {
    constructor(nodeId, alias, label, properties) {
        this.id = nodeId;
        this.alias = alias;
        this.label = label;
        this.properties = properties;
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

module.exports = Node;
