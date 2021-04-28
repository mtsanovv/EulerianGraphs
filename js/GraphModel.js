class GraphModel {
    constructor(graphInput, sequenceInput, errorField) {
        this.graphInput = graphInput;
        this.sequenceInput = sequenceInput;
        this.errorField = errorField;
        this.G = [];
    }
    //verify the graph input
    verifyInput() {
        const edges = this.graphInput.split(/\n+/);
        if(edges.length == 0 || (edges.length == 1 && edges[0].length == 0)) {
            //a graph with no edges
            return true;
        }
        for(const edge of edges) {
            const vertices = edge.split(/\s+/);
            if(vertices.length != 2) {
                this.errorField.innerText = 'Invalid graph submitted: one of the edges contains more than two space-separated values. Please also check for any extra and/or trailing whitespaces.';
                return false;
            } else if(vertices.length == 1 && vertices[0].length == 0) {
                this.errorField.innerText = 'Invalid graph submitted: one of the edges is empty.';
                return false;
            }
            for(const vertex of vertices) {
                if(!vertex.length) {
                    this.errorField.innerText = 'Invalid graph submitted: one of the vertices in one of the edges is empty.';
                    return false;
                } else if(!vertex.length || !Number.isInteger(Number(vertex))) {
                    this.errorField.innerText = 'Invalid graph submitted: one of the vertices in one of the edges is not an integer. Please also check for any extra and/or trailing whitespaces.';
                    return false;
                }
            }
        }
        return true;
    }
    //verify the sequence input
    verifySequenceInput() {
        if(!this.sequenceInput.length) {
            return false; //do not display any error, it's fine, it's an optional parameter
        }
        const vertices = this.sequenceInput.split(/\s+/);
        for(const vertex of vertices) {
            if(!vertex.length) {
                this.errorField.innerText = 'Invalid sequence of vertices submitted: one of the vertices is not an integer. Please also check for any extra and/or trailing whitespaces.';
                return false;
            } else if(!Array.isArray(this.G[Number(vertex)])) {
                this.errorField.innerText = 'Invalid sequence of vertices submitted: one of the vertices is not a part of the graph.';
                return false;
            }
        }
        return true;
    }

    //implement the depth-first search to traverse the graph
    dfs(root, checked, anotherG) {
        let G = this.G;
        if(anotherG) {
            G = anotherG;
        }

        //mark the element as checked
        checked[root] = true;

        //do the same for all the vertices adjacent to this vertex
        for(let i = 0; i < G[root].length; i++) {
            if(!checked[G[root][i]]) {
                this.dfs(G[root][i], checked, G);
            }
        }
    }

    //method to check if all non-zero degree vertices are connected
    verticesConnected(anotherG) {
        let G = this.G;
        if(anotherG) {
            G = anotherG;
        }

        if(!G.length) {
            return true; //a graph with no edges is also Eulerian
        }
        let checked = [];
        for(let i = 0; i < G.length; i++) {
            if(Array.isArray(G[i])) {
                checked[i] = false;
            }
        }
        let root;
        for(let i = 0; i < G.length; i++) {
            if(!Array.isArray(G[i])) {
                continue;
            }
            if(G[i].length) {
                root = i;
                break;
            }
        }
        
        //root can never be undefined because if we have edges, we have non-zero degree vertices
        this.dfs(root, checked);
        for(let i = 0; i < G.length; i++) {
            if(!Array.isArray(G[i])) {
                continue;
            }
            if(G[i].length && !checked[i]) {
                return false;
            }
        }
        return true;
    }
}