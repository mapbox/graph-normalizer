# Graph-normalizer

Takes nodes and ways in input and turn them into a graph object.

A graph is an object of this form:

```
{
  intersections: {
    intersectionId: { GeoJson Point with properties 'ways' and 'id' },
    ...
  },
  ways: {
    wayId: { geojson LineString with properties 'refs' and 'id' },
    ...
  }
}
```

This module exposes methods to create and modify graph objects.

## Input

Graph objects are created from `nodes` and `ways` which are GeoJson and that *must* satisfy the following:

- Nodes are GeoJson Point and have an `id` property.
- Ways are GeoJson LineString or MultiLineString and have an `id` property as well as a `refs` property that is an array of node ids (a comma delineated string is acceptable as well).
- Way coordinates have the exact same geometry as the node they represent.

Typically, graph-normalizer is used in tile-reduce scripts with input from [graph-tiler](https://github.com/mapbox/graph-tiler) which satisfies these requirements.

## Usage

### Installation

`$ npm install private-npm-url`

### Methods

`var graphNormalizer = require('graph-normalizer');`

#### Create graph

`graphNormalizer.createGraph(nodes, ways [, tile]);`

Return a graph where only the only nodes stored are intersections, and MultiLineString ways have been split in multiple LineString ways, with `!i` appended to their id, where `i` is the index of the geometry in the MultiLineString.

If a tile (`[x, y, z]` array) is provided, intersections strictly outside of the tile boundaries will be discarded, and tile ids will be appended to way ids.

#### Split intersections

`graphNormalizer.splitIntersections(graph);`

Modifies `graph` so that every way is guaranteed to **not** have any intersection outside of its first and last geometry coordinates.

Ways that have been split have a `!A` or `!B` appended to their id. Ways can be split multiple times consecutively.

#### Merge intersections

`graphNormalizer.mergeIntersections(graph);`

Modifies `graph` so that every intersection is guaranteed to connect at least 3 ways. This method is intended to work on a graph where `splitIntersections` has already run.

Ways that are merged result in a way whose id is `wayOne!M!wayTwo`, which keeps the order of the geometry coordinates and references to nodes.

#### Duplicate ways

`graphNormalizer.duplicateWays(graph);`

If the original ways have a `oneWay` property that is `0` or `1` (which the output of [graph-tiler](https://github.com/mapbox/graph-tiler) satisfies), two-directional ways will be duplicated into one-ways after `duplicateWays` is run.

Ways that are duplicated and reversed are appended a `!R` to their id.

#### Normalize graph

`graphNormalizer.normalizeGraph(nodes, ways [, tile]);`

This is just a wrapper around all previous methods.

The output of this method returns a graph that satisfies the following constraints:

- All way geometries in the original road network have an equivalent in the normalized graph.
- No intersection ever lies within a normalized way, only at its ends.
- Normalized way ids keep track of the history of transformations that led to it.
