Node = require("../src/node");
Edge = require("../src/edge");
Path = require("../src/path");

class PathBuilder {
    constructor(nodeCount){
        this.nodes = new Array();
        this.edges = new Array();
        this.currentAppendClass = Node;
    }

    append(obj){
        if(! obj instanceof this.currentAppendClass) throw "Error in path build insertion order and types."
        if(obj instanceof Node) return this._appendNode(obj);
        else return this._appendEdge(obj);
    }

    build(){
        return new Path(this.nodes, this.edges);
    }

    _appendNode(node){
        this.nodes.push(node);
        this.currentAppendClass = Edge;
        return this;
    }

    _appendEdge(edge){
        this.edges.push(edge);
        this.currentAppendClass = Node;
        return this;
    }
}

module.exports = PathBuilder;
