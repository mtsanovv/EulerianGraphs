class Grapher {
    constructor(G, tours, isDirected) {
        this.G = G;
        this.tours = tours;
        this.isDirected = isDirected;
        this.graphRow = document.getElementById('graphRow');
        this.toursWrapper = document.getElementById('toursWrapper');
    }

    draw() {
        //show the graph row and reset its and toursWrapper's contents
        this.graphRow.style.display = '';
        this.graphRow.innerHTML = '';
        this.toursWrapper.innerHTML = '';

        if(!this.G.length) {
            //if it's an empty array, just display a simple text that there's nothing to visualize
            this.graphRow.style.height = '65px';
            this.graphRow.innerHTML = '<div style="text-align: center; padding-top: 15px;"><font style="color: rgb(160, 90, 0);1"><ul><li>The graph is edgeless: there is nothing to display.</li></ul></div>';
            return;
        }
        this.graphRow.style.height = '450px';
        this.graphRow.innerHTML = '<h3 style="text-align: center; margin-top: 10px; padding-top: 38px; margin-bottom: 0px;">Graph visualization:</h3>';
        //draw the base graph
        this.drawGraph(this.graphRow);
        if(!this.tours.length) {
            //if there are no tours, just draw the graph, that's it
            this.toursWrapper.innerHTML = "";
            return;
        }
    }

    drawGraph(container) {

        const graphics = Viva.Graph.View.svgGraphics();

        //customize the links
        if(!this.isDirected) {
            //the graph is not directed (or we're not visualizing a tour)
            //keep it simple
            graphics.link(function(){
                return Viva.Graph.svg('line')
                                 .attr('stroke', 'black')
                                 .attr('stroke-width', '2px');
            });
        } else {
            //create the triangular marker
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

            const defs = graphics.getSvgRoot().append('defs');
            defs.append(marker);
            

            const geom = Viva.Graph.geom();

            graphics.link(function(){
                return Viva.Graph.svg('line')
                                 .attr('stroke', 'black')
                                 .attr('stroke-width', '2px')
                                 .attr('marker-end', 'url(#Triangle)');
            }).placeLink(function(linkUI, fromPos, toPos) {
                const nodeSize = config.GRAPH_NODE_RADIUS * 3 / 2 + 2;

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


        const graph = Viva.Graph.graph();

        const nodes = [];

        //populate the graph
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

        for(const node of nodes) {
            graph.addNode(node, node);
        }

        //custom nodes:
        graphics.node(function(node) {
            // node.data holds custom object passed to graph.addNode():
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
        });

        //custom nodes positioning:
        graphics.placeNode(function(nodeUI, pos) {
            //g doesn't have x or y, so we have to deal with transform
            nodeUI.attr('transform', 'translate(' + (pos.x) + ',' + (pos.y) + ')');
        });
        
        const renderer = Viva.Graph.View.renderer(graph, {
            graphics: graphics,
            container: container
        });
        renderer.run();
    }
}