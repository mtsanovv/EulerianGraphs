class EulerianGraphs {

    constructor() {
        this.outputField = document.getElementById('output');
        this.errorField = document.getElementById('errorField');
        this.graphModel = GraphModelFactory.createGraphModel(this.errorField);
    }

    createGraph() {
        this.errorField.innerText = '';
        this.outputField.innerHTML = '';
    
        if(this.graphModel.verifyInput()) {
            //convert the graph input into an actual graph
            this.graphModel.graphify();

            this.checkForEulerianCycles();
            this.checkForEulerianPaths();

            if(!this.errorField.innerText.length) {
                //hide the error field if no text is displayed
                this.toggleComponent(this.errorField, false);
            }
    
            this.graphModel.grapherDraw();
        } else {
            //show the error field and hide the graph row on error
            this.toggleComponent(this.errorField, true);
            this.graphModel.grapher.toggleGraphRow(false);
        }
    }
    
    toggleComponent(component, toggle) {
        if(toggle) {
            component.style.display = '';
        } else {
            component.style.display = 'none';
        }
    }

    listEulerianCycles() {
        const eulerianCycles = this.graphModel.findAllEulerianCycles();
                    
        let foundString = "<p style='text-align: center;'>";
        if(this.graphModel.limitEulerianTours) {
            foundString += "<div style='margin-bottom: 5px;'><font style='color: rgb(160, 90, 0);'>Note: not all available Eulerian cycles might have been found in order to get a final result in a reasonable time. <a href='https://en.wikipedia.org/wiki/Eulerian_path#Complexity_issues' target='_blank'>Learn more.</a></font></div>";
        }
        foundString += "<div>All Eulerian cycles found:</div>";
        this.outputField.innerHTML += foundString;

        for(let i = 0; i < eulerianCycles.length; i++) {
            if(Array.isArray(eulerianCycles[i])) {
                this.outputField.innerHTML += "<div style='font-weight: bold;'>" + eulerianCycles[i].join("➔") + "</div>";
            }
        }
        this.outputField.innerHTML += "</p>";
    }

    validatePathInput() {
        if(this.graphModel.verifySequenceInput()) {
            if(this.graphModel.isEulerianPath()) {
                this.outputField.innerHTML += "<ul><li style='color: rgb(6, 116, 3);'>The sequence input P is an Eulerian path.</li></ul>";
            } else {
                this.outputField.innerHTML += "<ul><li style='color: rgb(201, 0, 0);'>The sequence input P is not an Eulerian path.</li></ul>";
            }
        } else {
            //show the error field on path sequence input error
            this.toggleComponent(this.errorField, true);
        }
    }

    listEulerianPaths() {
        this.outputField.innerHTML += "<ul><li style='color: rgb(6, 116, 3);'>The graph G contains Eulerian path(s).</li></ul>";
        const eulerianPaths = this.graphModel.findAllEulerianPaths();
        
        let foundString = "<p style='text-align: center;'>";
        if(this.graphModel.limitEulerianTours) {
            foundString += "<div style='margin-bottom: 5px;'><font style='color: rgb(160, 90, 0);'>Note: not all available Eulerian paths might have been found in order to get a final result in a reasonable time. <a href='https://en.wikipedia.org/wiki/Eulerian_path#Complexity_issues' target='_blank'>Learn more.</a></font></div>";
        }
        foundString += "<div>All Eulerian paths found:</div>";
        this.outputField.innerHTML += foundString;

        for(let i = 0; i < eulerianPaths.length; i++) {
            if(Array.isArray(eulerianPaths[i])) {
                this.outputField.innerHTML += "<div style='font-weight: bold;'>" + eulerianPaths[i].join("➔") + "</div>";
            }
        }
        this.outputField.innerHTML += "</p>";
    }

    checkForEulerianCycles() {
        if(this.graphModel.hasEulerianCycle()) {
            this.outputField.innerHTML += "<ul><li style='color: rgb(6, 116, 3);'>The graph G contains Eulerian cycle(s).</li></ul>";
            if(!this.graphModel.isEdgeless()) {
                this.listEulerianCycles();
            }
        } else {
            this.outputField.innerHTML += "<ul><li style='color: rgb(201, 0, 0);'>The graph G does not have any Eulerian cycles.</li></ul>";
        }
    }

    checkForEulerianPaths() {
        if(this.graphModel.hasEulerianPath() && !this.graphModel.hasEulerianCycle()) {
            this.validatePathInput();
            this.listEulerianPaths();
        } else {
            this.outputField.innerHTML += "<ul><li style='color: rgb(201, 0, 0);'>The graph G does not have any Eulerian paths.</li></ul>";
        }
    }
}