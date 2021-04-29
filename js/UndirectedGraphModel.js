class UndirectedGraphModel extends GraphModel {
    constructor(graphInput, sequenceInput, errorField) {
        super(graphInput, sequenceInput, errorField);
        this.tours = [];
        this.T;
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
        return !Boolean(this.G.length); //return true if it's an edgeless graph
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

    //a method to mark an edge as visited for Hierholzer
    visitEdge(node1, node2, checked, subtour) {
        super.visitEdge(node1, node2, checked, subtour);
        checked[node2][node1] = true;
    }

    
}