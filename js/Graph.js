class Graph {
    constructor(graphInput, sequenceInput, errorElement) {
        this.graphInput = graphInput;
        this.sequenceInput = sequenceInput;
        this.errorField = errorField;
        this.G = [];
    }

    verifyInput() {
        const edges = this.graphInput.split(/\n+/);
        if(edges.length == 0 || (edges.length == 1 && edges[0].length == 0)) {
            this.errorField.innerText = 'Invalid graph submitted: the graph input field cannot be empty.';
            return false;
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
            for(const vertix of vertices) {
                if(!vertix.length) {
                    this.errorField.innerText = 'Invalid graph submitted: one of the vertices in one of the edges is empty.';
                    return false;
                } else if(!vertix.length || !Number.isInteger(Number(vertix))) {
                    this.errorField.innerText = 'Invalid graph submitted: one of the vertices in one of the edges is not an integer. Please also check for any extra and/or trailing whitespaces.';
                    return false;
                }
            }
        }
        return true;
    }
    graphify() {
        const edges = this.graphInput.split(/\n+/);
        for(const edge of edges) {
            const vertices = edge.split(/\s+/); 
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
}