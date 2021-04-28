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

    //check if the path in the sequence input is actually Eulerian
    isEulerianPath(passedP) {
        if(!this.hasEulerianPath()) {
            return false; //no point to check if there's no chance of Eulerian paths
        }

        let P = this.sequenceInput.split(/\s+/);
        if(passedP) {
            P = passedP;
        }
        let G = [];
        const edges = this.graphInput.split(/\n+/);
        if(edges.length != P.length - 1) {
            return false; // we need all the edges to be part of the eulerian path
        }
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

    //a method to mark all edges as unvisited for Hierholzer
    markAllUnvisited() {
        for(let i = 0; i < this.G.length; i++) {
            if(Array.isArray(this.G[i])) {
                if(!Array.isArray(this.T.checked[i])) {
                    this.T.checked[i] = [];
                    for(let j = 0; j < this.G[i].length; j++) {
                        this.T.checked[i][this.G[i][j]] = false;
                    }
                }
            }
        }
    }

    //a method to mark an edge as visited for Hierholzer
    visitEdge(node1, node2) {
        this.T.checked[node1][node2] = true;
        this.T.checked[node2][node1] = true;
        if(!this.T.subtour.length) {
            this.T.subtour.push(...[node1, node2]);
        } else {
            this.T.subtour.push(node2);
        }
    }

    //a method to complete a subtour for Hierholzer
    completeSubtour(element) {
        if(this.T.subtour.length && element == this.T.subtour[0]) {
            //subtour is a circle, it can be pushed back to tours
            if(!this.tours[this.tours.length - 1].length) {
                this.tours[this.tours.length - 1].push(...this.T.subtour);
            } else {
                const indexOfBeginNode = this.tours[this.tours.length - 1].lastIndexOf(this.T.subtour[0]);
                this.tours[this.tours.length - 1].splice(indexOfBeginNode + 1, 0, ...this.T.subtour);
                this.tours[this.tours.length - 1].splice(indexOfBeginNode, 1);
            }
            return true;
        }
        return false;
    }

    //a method to check if an Eulerian cycle has been found for Hierholzer
    eulerianCycleFound() {
        for(let i = 0; i < this.T.checked.length; i++) {
            if(Array.isArray(this.T.checked[i])) {
                for(let j = 0; j < this.T.checked[i].length; j++) {
                    if(this.T.checked[i][j] == false) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    //find unvisited edge for Hierholzer
    findUnvisitedEdge() {
        for(let i = 0; i < this.T.checked.length; i++) {
            if(Array.isArray(this.T.checked[i])) {
                for(let j = 0; j < this.T.checked[i].length; j++) {
                    if(this.T.checked[i][j] == false) {
                        return i;
                    }
                }
            }
        }
        return -1;
    }

    //a method that implements Hierholzer's algorithm
    hierholzer(element) {
        if(this.completeSubtour(element)) {
            this.T.subtour = [];
            if(this.eulerianCycleFound()) {
                return;
            } else {
                this.hierholzer(this.findUnvisitedEdge());
            }
        }
        let newNode = -1;
        for(let i = 0; i < this.G[element].length; i++) {
            if(this.T.checked[element][this.G[element][i]] == false) {
                newNode = this.G[element][i];
                this.visitEdge(element, this.G[element][i]);
                break;
            }
        }
        if(newNode == -1) {
            return; //hierholzer is done
        }
        this.hierholzer(newNode);
    }

    //find all eulerian cycles
    findAllEulerianCycles() {
        for(let i = 0; i < this.G.length; i++) {
            //find an eulerian cycle for each vertex
            if(Array.isArray(this.G[i])) {
                this.T = new Tour();
                this.tours[i] = []; //mark a new tour
                this.markAllUnvisited();
                this.hierholzer(i);
            }
        }
        return this.tours;
    }

    //a method that implements Hierholzer's algorithm for Eulerian paths
    findPath(element) {
        this.tours[this.tours.length - 1].push(element);
        for(let i = 0; i < this.G[element].length; i++) {
            if(this.T.checked[element][this.G[element][i]] == false) {
                this.visitEdge(element, this.G[element][i]);
                this.findPath(this.G[element][i]);
            }
        }
    }
    
    //find all eulerian paths
    findAllEulerianPaths() {
        for(let i = 0; i < this.G.length; i++) {
            //find an eulerian path for each vertix with odd degree
            if(Array.isArray(this.G[i]) && this.G[i].length % 2 != 0) {
                this.T = new Tour();
                this.tours.push([]); //mark a new tour
                this.markAllUnvisited();
                this.findPath(i);
            }
        }
        for(let i = 0; i < this.tours.length; i++) {
            if(!this.isEulerianPath(this.tours[i])) {
                this.tours.pop();
            }
        }
        return this.tours;
    }
}