class GraphModel {
    constructor(graphInput, sequenceInput, errorField, isDirected) {
        this.graphInput = graphInput;
        this.sequenceInput = sequenceInput;
        this.errorField = errorField;
        this.G = [];
        this.tours = [];
        this.isDirected = Boolean(isDirected);
        this.limitEulerianTours = false;
        this.grapher = new Grapher(this.G, this.isDirected);
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
            if(vertices.length > 2) {
                this.errorField.innerText = "Invalid graph submitted: the edge '" + edge + "' contains more than two space-separated values. Check also for any extra and/or trailing whitespaces.";
                return false;
            } else if(vertices.length == 1 && vertices[0].length == 0) {
                this.errorField.innerText = 'Invalid graph submitted: one of the edges is empty. Check for any extra new lines.';
                return false;
            } else if(vertices.length == 2 && vertices[0] == vertices[1]) {
                this.errorField.innerText = "Invalid graph submitted: the edge '" + edge + "' cannot exist.";
                return false;
            } else if(vertices.length < 2) {
                this.errorField.innerText = "Invalid graph submitted: the edge '" + edge + "' contains only one vertex (two are required).";
                return false;
            }

            for(const vertex of vertices) {
                if(!vertex.length) {
                    this.errorField.innerText = "Invalid graph submitted: one of the vertices in the edge '" + edge + "' is missing.";
                    return false;
                } else if(!Number.isInteger(Number(vertex))) {
                    this.errorField.innerText = "Invalid graph submitted: the vertex '" + vertex + "' in the edge '" + edge + "' is not an integer. Check also for any extra and/or trailing whitespaces.";
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
                this.errorField.innerText = 'Invalid sequence of vertices submitted: check for any extra and/or trailing whitespaces.';
                return false;
            } else if(!Number.isInteger(Number(vertex))) {
                this.errorField.innerText = "Invalid sequence of vertices submitted: the vertex '" + vertex + "' is not an integer.";
                return false;
            } else if(!Array.isArray(this.G[Number(vertex)])) {
                this.errorField.innerText = "Invalid sequence of vertices submitted: the vertex " +  vertex + " is not a part of the graph.";
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

    //find unvisited edge for Hierholzer
    findUnvisitedEdge(checked) {
        for(let i = 0; i < checked.length; i++) {
            if(Array.isArray(checked[i])) {
                for(let j = 0; j < checked[i].length; j++) {
                    if(checked[i][j] == false) {
                        return i;
                    }
                }
            }
        }
        return -1;
    }

    //a method to complete a subtour for Hierholzer
    completeSubtour(element, checked, subtour, tour) {
        if(subtour.length && element == subtour[0] || this.findUnvisitedEdge(checked) == -1) {
            //subtour is a circle or a path, it can be pushed back to the tour
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
    hierholzer(element, initial, checked, subtour, tour) {
        if(!initial && this.completeSubtour(element, checked, subtour, tour)) {
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
                    this.hierholzer(newNode, false, checked, subtour, tour);
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
                    this.hierholzer(this.G[element][i], false, newChecked, newSubtour, this.tours[this.tours.length - 1]);
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
            //if not an array, continue
            if(!Array.isArray(checked[i])) {
                continue;
            }

            for(let j = 0; j < checked[i].length; j++) {
                //if the edge has not been visited by the loop above, then this is surely not a cycle
                if(checked[i][j] == false) {
                    return false;
                }
            }
        }
        return true;
    }

    //check if the path in the sequence input is actually Eulerian
    isEulerianPath(passedP) {
        if(!this.hasEulerianPath()) {
            return false; //no point to check if there's no chance of Eulerian paths
        }

        let P;

        if(passedP) {
            P = passedP;
        } else {
            P = this.sequenceInput.split(/\s+/);
            //cast all numbers from the sequence input from strings to numbers
            for(let i = 0; i < P.length; i++) {
                P[i] = Number(P[i]);
            }
        }
        
        const checked = [];
        this.markAllUnvisited(checked);

        for(let i = 0; i < P.length - 1; i++) {
            //if the edge doesn't exist in the graph but is a part of the path, then the cycle is invalid
            if(this.G[P[i]].indexOf(P[i + 1]) == -1) {
                return false;
            }
            this.visitEdge(P[i], P[i + 1], checked, []); //visit the edges that are part of the path
        }
        for(let i = 0; i < checked.length; i++) {
            //if not an array, continue
            if(!Array.isArray(checked[i])) {
                continue;
            }

            for(let j = 0; j < checked[i].length; j++) {
                //if the edge has not been visited by the loop above, then this is surely not a path
                if(checked[i][j] == false) {
                    return false;
                }
            }
        }
        return true;
    }

    //find all Eulerian tours - cycles or paths
    findAllEulerianTours() {
        for(let i = 0; i < this.G.length; i++) {
            //find all Еulerian tours for each vertex
            if(Array.isArray(this.G[i])) {
                this.hierholzer(i, true);
            }
        }
    }

    //a method that finds all Eulerian cycles using Hierholzer
    findAllEulerianCycles() {
        this.findAllEulerianTours();

        const validTours = [];
        for(let i = 0; i < this.tours.length; i++) {
            if(this.isEulerianCycle(this.tours[i])) {
                validTours.push(this.tours[i]);
            }
        }
        this.tours = validTours;
        return this.tours;
    }

    //a method that finds all Eulerian paths using Hierholzer
    findAllEulerianPaths() {
        this.findAllEulerianTours();

        const validTours = [];
        for(let i = 0; i < this.tours.length; i++) {
            if(this.isEulerianPath(this.tours[i])) {
                validTours.push(this.tours[i]);
            }
        }
        this.tours = validTours;
        return this.tours;
    }

    //a method that calls the grapher and draws the graph + cycles and paths
    grapherDraw() {
        this.grapher.draw(this.tours);
    }
}