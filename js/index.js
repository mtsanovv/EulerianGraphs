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
    const isDirected = document.getElementById('isDirected').checked;
    errorField.innerText = '';
    outputField.innerHTML = '';

    let gm;
    if(isDirected) {
        gm = new DirectedGraphModel(graphInput, sequenceInput, errorField);
    } else {
        gm = new UndirectedGraphModel(graphInput, sequenceInput, errorField);
    }

    if(gm.verifyInput()) {
        const isEdgelessGraph = gm.graphify();
        if(gm.hasEulerianCycle()) {
            outputField.innerHTML += "<ul><li style='color: rgb(6, 116, 3);'>The graph G contains Eulerian cycle(s).</li></ul>";
            if(!isEdgelessGraph) {
                const eulerianCycles = gm.findAllEulerianCycles();
                outputField.innerHTML += "<p style='text-align: center;'><div>All Eulerian cycles found:</div>";
                for(let i = 0; i < eulerianCycles.length; i++) {
                    if(Array.isArray(eulerianCycles[i])) {
                        outputField.innerHTML += "<div style='font-weight: bold;'>" + eulerianCycles[i].join("➔") + "</div>";
                    }
                }
                outputField.innerHTML += "</p>";
            }
        } else {
            outputField.innerHTML += "<ul><li style='color: rgb(201, 0, 0);'>The graph G does not have any Eulerian cycles.</li></ul>";
        }
        if(gm.hasEulerianPath()) {
            if(gm.verifySequenceInput()) {
                if(gm.isEulerianPath()) {
                    outputField.innerHTML += "<ul><li style='color: rgb(6, 116, 3);'>The sequence input P is an Eulerian path.</li></ul>";
                } else {
                    outputField.innerHTML += "<ul><li style='color: rgb(201, 0, 0);'>The sequence input P is not an Eulerian path.</li></ul>";
                }
            }
            outputField.innerHTML += "<ul><li style='color: rgb(6, 116, 3);'>The graph G contains Eulerian path(s).</li></ul>";
            const eulerianPaths = gm.findAllEulerianPaths();
            outputField.innerHTML += "<p style='text-align: center;'><div>All Eulerian paths found:</div>";
            for(let i = 0; i < eulerianPaths.length; i++) {
                if(Array.isArray(eulerianPaths[i])) {
                    outputField.innerHTML += "<div style='font-weight: bold;'>" + eulerianPaths[i].join("➔") + "</div>";
                }
            }
            outputField.innerHTML += "</p>";
        } else {
            outputField.innerHTML += "<ul><li style='color: rgb(201, 0, 0);'>The graph G does not have any Eulerian paths.</li></ul>";
        }
    }
}