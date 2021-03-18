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
    const outputField = document.getElementById('output');
    errorField.innerText = '';
    outputField.innerHTML = '';
    let G = new GraphModel(graphInput, sequenceInput, errorField);
    if(G.verifyInput()) {
        G.graphify();
        const hasEulerianCycle = G.hasEulerianCycle()
        if(hasEulerianCycle) {
            outputField.innerHTML += "<ul><li style='color: rgb(6, 116, 3);'>The graph G has an Eulerian cycle.</li></ul>";
        } else {
            outputField.innerHTML += "<ul><li style='color: rgb(201, 0, 0);'>The graph G does not have an Eulerian cycle.</li></ul>";
        }
        if(G.verifySequenceInput()) {
            if(G.hasEulerianPath()) {
                if(G.isEulerianPath()) {
                    outputField.innerHTML += "<ul><li style='color: rgb(6, 116, 3);'>The sequence input P is an Eulerian path.</li></ul>";
                } else {
                    outputField.innerHTML += "<ul><li style='color: rgb(201, 0, 0);'>The sequence input P is not an Eulerian path.</li></ul>";
                }
            } else {
                outputField.innerHTML += "<ul><li style='color: rgb(201, 0, 0);'>The graph G does not have any Eulerian paths.</li></ul>";
            }
        }
    }
}