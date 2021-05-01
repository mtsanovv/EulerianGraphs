# EulerianGraphs
A JS app that deals with Eulerian cycles and paths. It works for both undirected and directed graphs.

## Notes
- It was created for an assignment at my university, TU-Sofia. Here's the assignment, translated:
    > Given any graph G, create an app that:
    > - checks if there is an Eulerian cycle in the graph G;
    > - checks if a finite sequence of vertices P is an Eulerian path in the graph G;
    > - finds all Eulerian paths in the graph G;
    > - finds all Eulerian cycles in the graph G (if any are available);
    > - visualizes the graph G, the paths and the cycles.
- Unfortunately, it may not be able to find all the possible Eulerian cycles and paths, especially in larger undirected graphs. [This explains why.](https://en.wikipedia.org/wiki/Eulerian_path#Complexity_issues) To configure what is the biggest undirected graph for which the algorithm will figure out absolutely all cycles or paths, configure the ```MAX_EDGES_IN_UNDIRECTED_GRAPH_BEFORE_TOURS_LIMIT``` parameter in ```config.js```. Based on my tests, 7 edges has been set as the default. It seems to be a big enough undirected graph that in a worst-case scenario can have all of its cycles or paths found in a reasonable amount of time and their visualization can be done using a reasonable amount of hardware resources.
- The graphs.txt file contains some graphs that can be used for toying with the tool.

## Credits
- Graph visualization: [VivaGraphJS](https://github.com/anvaka/VivaGraphJS)

*M. Tsanov, 2021*