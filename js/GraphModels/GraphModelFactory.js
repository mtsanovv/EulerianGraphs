class GraphModelFactory {
    static createGraphModel(errorField) {
        const graphInput = document.getElementById('graphInput').value;
        const sequenceInput = document.getElementById('sequenceInput').value;
        const isDirected = document.getElementById('isDirected').checked;

        if(isDirected) {
            return new DirectedGraphModel(graphInput, sequenceInput, errorField);
        } else {
            return new UndirectedGraphModel(graphInput, sequenceInput, errorField);
        }
    }
}