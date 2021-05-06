function graphInputChanged(obj) {
    const invalidChars = /[^(\d|\s)]/;
    if(invalidChars.test(obj.value)) {
        obj.value = obj.value.replace(invalidChars, '');
    }
}

function createGraph() {
    const eg = new EulerianGraphs();
    eg.createGraph();
}