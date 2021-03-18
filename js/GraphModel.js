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
            this.G[Number(vertices[1])].push(Number(vertices[0]));
        }
    }
    //implement the depth-first search to traverse the graph
    dfs(root, checked) {
        //mark the element as checked
        checked[root] = true;

        //do the same for all the vertices adjacent to this vertex
        for(let i = 0; i < this.G[root].length; i++) {
            if(!checked[this.G[root][i]]) {
                this.dfs(this.G[root][i], checked);
            }
        }
    }
    //method to check if all non-zero degree vertices are connected
    verticesConnected() {
        if(!this.G.length) {
            return true; //a graph with no edges is also Eulerian
        }
        let checked = [];
        for(let i = 0; i < this.G.length; i++) {
            if(Array.isArray(this.G[i])) {
                checked[i] = false;
            }
        }
        let root;
        for(let i = 0; i < this.G.length; i++) {
            if(!Array.isArray(this.G[i])) {
                continue;
            }
            if(this.G[i].length) {
                root = i;
                break;
            }
        }

        //root can never be undefined because if we have edges, we have non-zero degree vertices
        this.dfs(root, checked);
        for(let i = 0; i < this.G.length; i++) {
            if(!Array.isArray(this.G[i])) {
                continue;
            }
            if(this.G[i].length && !checked[i]) {
                return false;
            }
        }
        return true;
    }
    //check if there is at least one Eulerian cycle in the graph
    hasEulerianCycle() {
        if(!this.verticesConnected()) {
            return false;
        }

        //count of vertices with odd degrees
        let odd = 0;
        for(let i = 0; i < this.G.length; i++) {
            if(Array.isArray(this.G[i]) && this.G[i].length % 2 != 0) {
                odd++;
            }
        }

        if(!odd) {
            return true; //if no odd vertices, we can be sure that there is at least one Eulerian cycle
        }
        return false; //semi-eulerian and non-eulerian mean there's no eulerian cycle
    }
    //check if there's an Eulerian path in the graph
    hasEulerianPath() {
        if(!this.verticesConnected()) {
            return false;
        }
        //count of vertices with odd degrees
        let odd = 0;
        for(let i = 0; i < this.G.length; i++) {
            if(Array.isArray(this.G[i]) && this.G[i].length % 2 != 0) {
                odd++;
            }
        }

        if(odd != 2) {
            return false; //only when there are 2 odd vertices that's the only case when we can have an Eulerian path
        }
        return true;
    }
    //check if the path in the sequence input is actually Eulerian
    isEulerianPath() {
        if(!this.hasEulerianPath()) {
            return false; //no point to check if there's no chance of Eulerian paths
        }

        const P = this.sequenceInput.split(/\s+/);
        let G = [];
        const edges = this.graphInput.split(/\n+/);
        for(const edge of edges) {
            const vertices = edge.split(/\s+/);
            if(vertices.length != 2) {
                continue;
            }
            if(!Array.isArray(G[Number(vertices[0])])) {
                G[Number(vertices[0])] = [];
            }
            G[Number(vertices[0])].push(Number(vertices[1]));

            if(!Array.isArray(G[Number(vertices[1])])) {
                G[Number(vertices[1])] = [];
            }
            G[Number(vertices[1])].push(Number(vertices[0]));
        }
        for(let i = 0; i < P.length - 1; i++) {
            const ce = Number(P[i]);
            const ne = Number(P[i + 1]);
            const ine = G[ce].indexOf(ne);
            const ice = G[ne].indexOf(ce);
            if(ice == -1 && ine == -1) {
                // the edge is really repeating...
                return false;
            }
            G[ce].splice(ine, 1);
            G[ne].splice(ice, 1);
        }
        return true;
    }
}