# Graph-normalizer

[![Build Status](https://travis-ci.com/mapbox/graph-normalizer.svg?token=L2z9Dgm3tWM4E4xpoHDL&branch=master)](https://travis-ci.com/mapbox/graph-normalizer)


`graph-normalizer` is a Command Line Interface that pipes in a geojson file of ways (usually at the z7 level), and outputs normalized pieces of graph at a given zoom level.

This package is intended as a utility for graph-tiler, but can be used on its own.

### Installation

`npm install @mapbox/graph-normlizer`

### Usage

```
node_modules/graph-normalizer/bin/normalize-ways \
  --waysFile <geojson line-delimited ways file> \
  --outputPath <output path> \
  --zoomLevel <output zoom level - default 14>
```

The output is a number of files, named `<quadkey>.json`, of line-delimited geojson way features.

It satisfies the following constraints:
- All way geometries in the original road network have an equivalent in the normalized graph.
- No intersection ever lies within a normalized way, only at its ends.
- Normalized way ids keep track of the history of transformations that led to it.
- `highway` and `oneway` tags are conserved from the original graph.

Edges that are shared by multiple tiles are conserved in all of them.

It is recommended to keep the output zoom level high, as performance might drop when trying to normalize at a larger scale.

### Algorithm

`graph-normalizer` expects geojson LineString features that have a `refs` property, each ref corresponding to the node id of the matching coordinates in the `geometry.coordinates` array.

Any way that does not respect this constraint will be dropped.

The algorithm follows this workflow:

- **Indexing** - It loads the ways into memory and indexes their segments into the quadkey(s) of the target zoom level in which they land.

- **Tiling** - For each quadkey, it reconstructs each way from its segments. The segments of the original way that do not intersect with the tile are effectively dropped from this tile. Conversely, any segment that overlaps multiple tiles will be duplicated in all tiles.

- **Splitting** - Having the ways from each quadkey, `graph-normalizer` then splits the ways that traverse an intersection into two. `!<i>` is appended to the way id where `i` is the index of the split way in the original geometry.

- **Merging** - Ways that share a node which is not an intersection (only 2 way owners) are merged together. The resulting id is `<wayOne>,<wayTwo>`.

### Tests

```
npm test
```

### Benchmarks

```
npm run bench
```