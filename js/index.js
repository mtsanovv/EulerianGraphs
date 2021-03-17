function graphInputChanged(obj) {
    const invalidChars = /[^(\d|\s)]/;
    if(invalidChars.test(obj.value)) {
        obj.value = obj.value.replace(invalidChars, '');
    }
}

function createGraph() {
    const graphInput = document.getElementById('graphInput').value;
    const sequenceInput = document.getElementById('sequenceInput').value;
    const errorField = document.getElementById('errorField');
    errorField.innerText = '';
    let G = new Graph(graphInput, sequenceInput, errorField);
    if(G.verifyInput) {
        G.graphify();
    }
}