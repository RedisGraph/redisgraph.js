class Path {
    constructor(nodes, edges){
        this.nodes = nodes;
        this.edges = edges;
    }

    get Nodes(){
        return this.nodes;
    }

    get Edges(){
        return this.edges;
    }

    getNode(index){
        return this.nodes[index];
    }

    getEdge(index){
        return this.edges[index];
    }

    get firstNode(){
        return this.nodes[0];
    }

    get lastNode(){
        return this.nodes[this.nodes.length -1];
    }

    get nodeCount(){
        return this.nodes.length;
    }

    get edgeCount(){
        return this.edges.length;
    }

    toString() {
        return JSON.stringify(this);
    }

}

module.exports = Path;
