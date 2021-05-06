class Grapher {
    constructor(G, isDirected) {
        this.G = G;
        this.tours = [];
        this.isDirected = isDirected;
        this.graphRow = document.getElementById('graphRow');
    }

    clearGraphRow() {
        this.graphRow.innerHTML = '';
    }

    toggleGraphRow(toggle) {
        if(toggle) {
            this.graphRow.style.display = '';
        } else {
            this.graphRow.style.display = 'none';
        }
    }

    draw(tours) {
        //set the tours
        this.tours = tours;

        this.toggleGraphRow(true);
        this.clearGraphRow();
        this.initializeGraphContainer();
        this.drawGraph();
    }

    initializeGraphContainer() {
        if(!this.G.length) {
            //if it's an empty array, just display a simple text that there's nothing to visualize
            this.graphRow.style.height = '65px';
            this.graphRow.innerHTML = '<div style="text-align: center; padding-top: 15px;"><font style="color: rgb(160, 90, 0);1"><ul><li>The graph is edgeless: there is nothing to display.</li></ul></div>';
            return;
        }
        this.graphRow.style.height = '520px';
        this.graphRow.innerHTML = '<h3 style="text-align: center; margin-top: 10px; padding-top: 20px; margin-bottom: 20px;">Graph visualization:</h3>';
        if(this.tours.length && !this.isDirected) {
            this.addTourOptions();
        }
    }

    addTourOptions() {
        const grapher = this;
        this.graphRow.innerHTML += '<div style="text-align: center;"><label for="tourSelection" style="margin-right: 10px;">Eulerian tour to visualize:</label><select id="tourSelection"><option value="-1">No tour selected</option></select>';
        const tourDropdown = document.querySelector('#tourSelection');
        for(let i = 0; i < this.tours.length; i++) {
            if(Array.isArray(this.tours[i])) {
                tourDropdown.innerHTML += '<option value="' + i + '">' + this.tours[i].join("➔") + '</option>';
            }
        }
        this.graphRow.innerHTML += '</div>';
        //we cannot use tourDropdown here because apparently it does not contain its options in a proper way so that addEventListener can be called
        document.getElementById('tourSelection').addEventListener('change', (event) => {
            const tourIndex = Number(event.target.value);
            //remove the old graph
            if(this.graphRow.lastElementChild.tagName == 'svg') {
                this.graphRow.removeChild(this.graphRow.lastElementChild);
            }

            if(tourIndex == -1) {
                grapher.drawGraph();
            } else {
                grapher.drawGraph(this.tours[tourIndex]);
            }
        });
    }

    drawGraph(tour) {
        this.graphics = Viva.Graph.View.svgGraphics();

        const graph = Viva.Graph.graph();
        const nodes = [];

        this.createCustomLinks(tour);
        this.populateGraph(tour, graph, nodes);
        this.createCustomNodes();
        
        this.renderGraph(graph);
    }

    createCustomLinks(tour) {
        if(!this.isDirected && !tour) {
            //the graph is not directed (or we're not visualizing a tour)
            this.createCustomUndirectedNodeLink();
        } else {
            this.createCustomDirectedNodeLink();
        }
    }

    createTriangularMarker() {
        const createMarker = function(id) {
            return Viva.Graph.svg('marker')
                             .attr('id', id)
                             .attr('viewBox', "0 0 10 10")
                             .attr('refX', "10")
                             .attr('refY', "5")
                             .attr('markerUnits', "strokeWidth")
                             .attr('markerWidth', "10")
                             .attr('markerHeight', "5")
                             .attr('orient', "auto");
        },
        marker = createMarker('Triangle');
        marker.append('path').attr('d', 'M 0 0 L 10 5 L 0 10 z');

        const defs = this.graphics.getSvgRoot().append('defs');
        defs.append(marker);
    }

    createCustomUndirectedNodeLink() {
        this.graphics.link(function(){
            return Viva.Graph.svg('line')
                             .attr('stroke', 'black')
                             .attr('stroke-width', '2px');
        });
    }

    createCustomDirectedNodeLink() {
        const geom = Viva.Graph.geom();

        this.createTriangularMarker();

        this.graphics.link(function(){
            return Viva.Graph.svg('line')
                             .attr('stroke', 'black')
                             .attr('stroke-width', '2px')
                             .attr('marker-end', 'url(#Triangle)');
        }).placeLink(function(linkUI, fromPos, toPos) {
            const nodeSize = config.GRAPH_NODE_RADIUS * 3 / 2 + 2;
            
            //we have to shorten the link to point the node outlines
            const from = geom.intersectRect(
                    // rectangle:
                            fromPos.x - nodeSize / 2, // left
                            fromPos.y - nodeSize / 2, // top
                            fromPos.x + nodeSize / 2, // right
                            fromPos.y + nodeSize / 2, // bottom
                    // segment:
                            fromPos.x, fromPos.y, toPos.x, toPos.y)
                       || fromPos; // if no intersection found - return center of the node

            const to = geom.intersectRect(
                    // rectangle:
                            toPos.x - nodeSize / 2, // left
                            toPos.y - nodeSize / 2, // top
                            toPos.x + nodeSize / 2, // right
                            toPos.y + nodeSize / 2, // bottom
                    // segment:
                            toPos.x, toPos.y, fromPos.x, fromPos.y)
                        || toPos; // if no intersection found - return center of the node
            linkUI.attr('x1', from.x)
                  .attr('x2', to.x)
                  .attr('y1', from.y)
                  .attr('y2', to.y);
        });
    }

    populateGraph(tour, graph, nodes) {
        if(!tour) {
            //populate the graph with the data from G
            for(let i = 0; i < this.G.length; i++) {
                if(Array.isArray(this.G[i])) {
                    for(const anotherNode of this.G[i]) {
                        if(nodes.indexOf(i) == -1) {
                            nodes.push(i);
                        }
                        if(nodes.indexOf(anotherNode) == -1) {
                            nodes.push(anotherNode);
                        }
                        graph.addLink(i, anotherNode);
                    }
                }
            }
        } else {
            //populate the graph with the data from the tour
            for(let i = 0; i < tour.length - 1; i++) {
                const currentElement = tour[i];
                const nextElement = tour[i + 1];
                if(nodes.indexOf(currentElement) == -1) {
                    nodes.push(currentElement);
                }
                if(nodes.indexOf(nextElement) == -1) {
                    nodes.push(nextElement);
                }
                graph.addLink(currentElement, nextElement);
            }
        }

        for(const node of nodes) {
            graph.addNode(node, node);
        }
    }

    createCustomNodes() {
        this.graphics.node(function(node) {
            // node.data holds the second argument passed to graph.addNode(), which in our case is an integer - the number of the node:
            const g = Viva.Graph.svg('g');
            const circle = Viva.Graph.svg('circle')
                                     .attr('fill', '#fff')
                                     .attr('stroke', 'black')
                                     .attr('stroke-width', '3px')
                                     .attr('r', config.GRAPH_NODE_RADIUS);
            const number = Viva.Graph.svg('text')
                                     .attr('text-anchor', 'middle')
                                     .attr('fill', '#000')
                                     .attr('dy', '.3em')
                                     .text(node.data);
            g.append(circle);
            g.append(number);
            return g;
        }).placeNode(function(nodeUI, pos) {
            //the svg object g doesn't have x or y, so we have to deal with transform
            nodeUI.attr('transform', 'translate(' + (pos.x) + ',' + (pos.y) + ')');
        });
    }

    renderGraph(graph) {
        const renderer = Viva.Graph.View.renderer(graph, {
            graphics: this.graphics,
            container: this.graphRow
        });
        renderer.run();
    }
}