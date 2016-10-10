# Graph-normalizer

[![Build Status](https://travis-ci.com/mapbox/graph-normalizer.svg?token=L2z9Dgm3tWM4E4xpoHDL&branch=master)](https://travis-ci.com/mapbox/graph-normalizer)


In this latest v2 version, graph-normalizer is a Command Line Interface that pipes in a geojson file of ways (usually at the z7 level), and outputs normalized pieces of graph at the z14 level.

This package is intended as a utility for graph-tiler.

### Installation

`npm install @mapbox/graph-normlizer`

### Usage

```
node_modules/graph-normalizer/bin/normalize-ways \
  --waysFile <geojson line-delimited ways file> \
  --outputPath <output path> \
  --zoomLevel <output zoom level - default 14>
```

The output is a number of files, each named by its quadkey, of line-delimited geojson way features.

It satisfies the following constraints:
- All way geometries in the original road network have an equivalent in the normalized graph.
- No intersection ever lies within a normalized way, only at its ends.
- Normalized way ids keep track of the history of transformations that led to it.

Edges that are shared by multiple tiles are conserved in all of them.
