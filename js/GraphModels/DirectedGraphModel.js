class DirectedGraphModel extends GraphModel {

    constructor(graphInput, sequenceInput, errorField) {
        super(graphInput, sequenceInput, errorField, true);
        this.inDegrees = [];
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

            if(this.inDegrees[Number(vertices[0])] === void 0) {
                //create in degree count for the first vertex as well
                this.inDegrees[Number(vertices[0])] = 0;
            }

            if(this.inDegrees[Number(vertices[1])] === void 0) {
                this.inDegrees[Number(vertices[1])] = 1;
            } else {
                this.inDegrees[Number(vertices[1])]++;
            }
        }
    }

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
    
    hasEulerianPath() {
        let inDegreeMoreThanOutDegreeVertexCount = 0;
        let outDegreeMoreThanInDegreeVertexCount = 0;
        for(let i = 0; i < this.G.length; i++) {
            if(!Array.isArray(this.G[i])) {
                continue;
            }
            if(this.G[i].length == this.inDegrees[i] + 1) {
                inDegreeMoreThanOutDegreeVertexCount++;
                continue;
            } else if(this.G[i].length + 1 == this.inDegrees[i]) {
                outDegreeMoreThanInDegreeVertexCount++;
                continue;
            } else if(this.G[i].length != this.inDegrees[i]) {
                //if a vertex is not one of the two "special ones" it should have in degree equal to its out degree
                return false;
            }
        }

        if(inDegreeMoreThanOutDegreeVertexCount > 1 || outDegreeMoreThanInDegreeVertexCount > 1) {
            //A directed graph has an Eulerian path only if:
            //at most there's only one vertex for which indegree + 1 == outdegree
            //at most there's only one vertex for which outdegree + 1 == indegree
            //all other vertices have indegree == outdegree
            return false;
        }
        return true;
    }
}