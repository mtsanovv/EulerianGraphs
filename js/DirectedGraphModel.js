class DirectedGraphModel extends GraphModel {
    constructor(graphInput, sequenceInput, errorField) {
        super(graphInput, sequenceInput, errorField);
        this.inDegrees = [];
        this.tours = [];
    }

    //convert the graph input into an actual graph
    graphify() {
        const edges = this.graphInput.split(/\n+/);
        for(const edge of edges) {
            const vertices = edge.split(/\s+/);
            if(vertices.length != 2) {
                continue;
            }
            if(!Array.isArray(this.G[Number(vertices[0])])) {
                this.G[Number(vertices[0])] = [];
            }
            this.G[Number(vertices[0])].push(Number(vertices[1]));

            if(!Array.isArray(this.G[Number(vertices[1])])) {
                this.G[Number(vertices[1])] = [];
            }

            if(this.inDegrees[Number(vertices[1])] === void 0) {
                this.inDegrees[Number(vertices[1])] = 1;
            } else {
                this.inDegrees[Number(vertices[1])]++;
            }
        }
        return !Boolean(this.G.length); //return true if it's an edgeless graph
    }

    //a method that returns a transpose of the graph
    transposeGraph() {
        const tG = [];
        for(let i = 0; i < this.G.length; i++) {
            if(!Array.isArray(this.G[i])) {
                continue;
            }
            for(let j = 0; j < this.G[i].length; j++) {
                if(!Array.isArray(tG[this.G[i][j]])) {
                    tG[this.G[i][j]] = [];
                }
                tG[this.G[i][j]].push(i);
            }
        }
        return tG;
    }

    //check if the graph is strongly connected
    isStronglyConnected() {
        //dfs the original graph, all edges should be visited
        if(!this.verticesConnected()) {
            return false;
        }

        //get a transpose of the graph, dfs it and all edges should be visited again
        const transposeGraph = this.transposeGraph();
        if(!this.verticesConnected(transposeGraph)) {
            return false;
        }

        return true;
    }

    //check if there is at least one Eulerian cycle in the graph
    hasEulerianCycle() {
        if(!this.isStronglyConnected()) {
            return false;
        }

        //all vertices' in degrees should be equal to their out degrees
        for(let i = 0; i < this.G.length; i++) {
            if(Array.isArray(this.G[i]) && this.G[i].length != this.inDegrees[i]) {
                return false;
            }
        }

        return true;
    }

    //a method that checks if there's at least one Eulerian path in the graph
    hasEulerianPath() {
        let inDegreeMoreThanOutDegreeVertexCount = 0;
        let outDegreeMoreThanInDegreeVertexCount = 0;
        for(let i = 0; i < this.G.length; i++) {
            if(!Array.isArray(this.G[i])) {
                continue;
            }
            if(this.G[i].length == this.inDegrees[i] + 1) {
                inDegreeMoreThanOutDegreeVertexCount++;
            } else if(this.G[i].length + 1 == this.inDegrees[i]) {
                outDegreeMoreThanInDegreeVertexCount++;
            } else if(this.G[i].length != this.inDegrees[i]) {
                //if a vertex is not one of the two "special ones" it should have in degree equal to its out degree
                return false;
            }
        }

        if(inDegreeMoreThanOutDegreeVertexCount != 1 || outDegreeMoreThanInDegreeVertexCount != 1) {
            //A directed graph has an Eulerian path only if:
            //there's only one vertex for which indegree + 1 == outdegree
            //there's only one vertex for which outdegree + 1 == indegree
            //all other vertices have indegree == outdegree
            return false;
        }
        return true;
    }
}