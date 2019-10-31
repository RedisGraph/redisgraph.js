class Path {
    constructor(nodes, edges){
        this.nodes = nodes;
        this.edges = edges;
    }

    getNodes(){
        return this.nodes;
    }

    getEdges(){
        return this.edges;
    }

    getNode(index){
        return this.nodes[index];
    }

    getEdge(index){
        return this.edges[index];
    }

    firstNode(){
        return this.nodes[0];
    }

    lastNode(){
        return this.nodes[this.nodes.length -1];
    }

    nodeCount(){
        return this.nodes.length;
    }

    edgeCount(){
        return this.edges.length;
    }

    toString() {
        return JSON.stringify(this);
    }

}

module.exports = Path;
