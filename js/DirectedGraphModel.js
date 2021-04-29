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

    //a method to mark all edges as unvisited for Hierholzer
    markAllUnvisited(checked) {
        for(let i = 0; i < this.G.length; i++) {
            if(Array.isArray(this.G[i])) {
                if(!Array.isArray(checked[i])) {
                    checked[i] = [];
                    for(let j = 0; j < this.G[i].length; j++) {
                        checked[i][this.G[i][j]] = false;
                    }
                }
            }
        }
    }

    //a method to mark an edge as visited for Hierholzer
    visitEdge(node1, node2, checked, subtour) {
        checked[node1][node2] = true;
        if(!subtour.length) {
            subtour.push(...[node1, node2]);
        } else {
            subtour.push(node2);
        }
    }

    //a method to complete a subtour for Hierholzer
    completeSubtour(element, subtour, tour) {
        if(subtour.length && element == subtour[0]) {
            //subtour is a circle, it can be pushed back to the tour
            if(!tour.length) {
                tour.push(...subtour);
            } else {
                const indexOfBeginNode = tour.lastIndexOf(subtour[0]);
                tour.splice(indexOfBeginNode + 1, 0, ...subtour);
                tour.splice(indexOfBeginNode, 1);
            }
            return true;
        }
        return false;
    }

    //a method that implements Hierholzer's algorithm
    hierholzer(element, checked, subtour, tour, initial) {
        if(this.completeSubtour(element, subtour, tour)) {
            subtour = [];
        }

        let newNode = -1;

        const subtourSplit = [];
        const tourSplit = [];
        for(let i = 0; i < this.G[element].length; i++) {
            if(initial || checked[element][this.G[element][i]] == false) {
                if(newNode == -1 && !initial) {
                    newNode = this.G[element][i];
                    subtourSplit.push(...subtour);
                    tourSplit.push(...tour);
                    this.visitEdge(element, this.G[element][i], checked, subtour);
                    this.hierholzer(newNode, checked, subtour, tour);
                } else {
                    //out degree for this vertex is > 0 (or just the degree > 1 in undirected graph), so we need to run hierholzer for that variant too
                    const newChecked = [];
                    const newSubtour = [];
                    this.markAllUnvisited(newChecked);
                    //mark as visited the visited edges so far (both from the subtour and the subtour)
                    for(let j = 0; j < tourSplit.length - 1; j++) {
                        this.visitEdge(tourSplit[j], tourSplit[j + 1], newChecked, []);
                    }
                    for(let j = 0; j < subtourSplit.length - 1; j++) {
                        this.visitEdge(subtourSplit[j], subtourSplit[j + 1], newChecked, []);
                    }
                    newSubtour.push(...subtourSplit);
                    this.tours.push([...tourSplit]); //mark a new tour
                    this.visitEdge(element, this.G[element][i], newChecked, newSubtour);
                    this.hierholzer(this.G[element][i], newChecked, newSubtour, this.tours[this.tours.length - 1]);
                }
            }
        }
    }

    //function to check if the tour is an Eulerian cycle
    isEulerianCycle(tour) {
        const checked = [];
        this.markAllUnvisited(checked);

        for(let i = 0; i < tour.length - 1; i++) {
            //if the edge doesn't exist in the graph but is a part of the tour, then the cycle is invalid
            if(this.G[tour[i]].indexOf(tour[i + 1]) == -1) {
                return false;
            }
            this.visitEdge(tour[i], tour[i + 1], checked, []); //visit the edges that are part of the tour
        }
        for(let i = 0; i < checked.length; i++) {
            for(let j = 0; j < checked[i].length; j++) {
                //if the edge has not been visited by the loop above, then this is surely not a cycle
                if(checked[i][j] == false) {
                    return false;
                }
            }
        }
        return true;
    }

    //find all eulerian cycles
    findAllEulerianCycles() {
        for(let i = 0; i < this.G.length; i++) {
            //find all eulerian cycles for each vertex
            if(Array.isArray(this.G[i])) {
                this.hierholzer(i, [], [], this.tours[this.tours.length - 1], true);
            }
        }

        const validTours = [];
        for(let i = 0; i < this.tours.length; i++) {
            if(this.isEulerianCycle(this.tours[i])) {
                validTours.push(this.tours[i]);
            }
        }
        this.tours = validTours;
        return this.tours;
    }
}