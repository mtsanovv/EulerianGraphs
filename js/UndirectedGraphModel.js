class UndirectedGraphModel extends GraphModel {
    constructor(graphInput, sequenceInput, errorField) {
        super(graphInput, sequenceInput, errorField);
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
            this.G[Number(vertices[1])].push(Number(vertices[0]));
        }
        if(edges.length > config.MAX_EDGES_IN_UNDIRECTED_GRAPH_BEFORE_TOURS_LIMIT) {
            this.limitEulerianTours = true;
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

    //a method to check if an Eulerian cycle has been found for Hierholzer (used only when there's tours limit)
    eulerianCycleFound(checked) {
        for(let i = 0; i < checked.length; i++) {
            if(Array.isArray(checked[i])) {
                for(let j = 0; j <checked[i].length; j++) {
                    if(checked[i][j] == false) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    //a method that implements Hierholzer's algorithm
    hierholzer(element, initial, checked, subtour, tour) {
        if(!this.limitEulerianTours) {
            //if no limit to eulerian tours has been applied, use the parent method
            return super.hierholzer(element, initial, checked, subtour, tour);
        }

        if(this.completeSubtour(element, checked, subtour, tour)) {
            subtour = [];
            if(this.eulerianCycleFound(checked)) {
                return;
            } else {
                this.hierholzer(this.findUnvisitedEdge(checked), false, checked, subtour, tour);
            }
        }

        let newNode = -1;

        for(let i = 0; i < this.G[element].length; i++) {
            if(checked[element][this.G[element][i]] == false) {
                newNode = this.G[element][i];
                this.visitEdge(element, this.G[element][i], checked, subtour);
                break;
            }
        }

        if(newNode == -1) {
            return; //hierholzer is done
        }

        this.hierholzer(newNode, false, checked, subtour, tour);
    }

    //find all Eulerian tours - cycles or paths
    findAllEulerianTours() {
        if(!this.limitEulerianTours) {
            //if no limit to eulerian tours has been applied, use the parent method
            return super.findAllEulerianTours();
        }
        for(let i = 0; i < this.G.length; i++) {
            //find all Еulerian tours for each vertex
            if(Array.isArray(this.G[i])) {
                const checked = [];
                this.markAllUnvisited(checked);
                this.tours.push([]); //mark a new tour
                this.hierholzer(i, true, checked, [], this.tours[this.tours.length - 1]);
            }
        }
    }

    //a method that implements Hierholzer's algorithm for Eulerian paths (used only when there's tours limit)
    findPath(element, checked) {
        this.tours[this.tours.length - 1].push(element);
        for(let i = 0; i < this.G[element].length; i++) {
            if(checked[element][this.G[element][i]] == false) {
                this.visitEdge(element, this.G[element][i], checked, []);
                this.findPath(this.G[element][i], checked);
            }
        }
    }

    //find all Eulerian paths
    findAllEulerianPaths() {
        if(!this.limitEulerianTours) {
            //if no limit to eulerian tours has been applied, use the parent method
            return super.findAllEulerianPaths();
        }
        for(let i = 0; i < this.G.length; i++) {
            //find an eulerian path for each vertix with odd degree
            if(Array.isArray(this.G[i]) && this.G[i].length % 2 != 0) {
                const checked = [];
                this.markAllUnvisited(checked);
                this.tours.push([]); //mark a new tour
                this.findPath(i, checked);
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