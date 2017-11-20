# Graph-normalizer

[![Build Status](https://travis-ci.com/mapbox/graph-normalizer.svg?token=L2z9Dgm3tWM4E4xpoHDL&branch=master)](https://travis-ci.com/mapbox/graph-normalizer)

`graph-normalizer` is a JavaScript module that performs operations on an array of GeoJSON LineStrings representing OpenStreetMap ways. The operations performed cover a standard set of graph normalization techniques such as merging edges between intersections and splitting edges that cross over intersections. Ids assigned to ways in the normalized graph are deterministic and reproducible.

### Installation

```sh
npm install @mapbox/graph-normlizer
```

### Test

```sh
npm test
```

### Benchmark

```
npm run bench
```

### Use

```js
var normalizer = require('@mapbox/graph-normalizer');

var ways = require('./ways.json');

var splitWays = normalizer.splitWays(ways);
var mergedWays = normalizer.mergeWays(ways);

console.log(JSON.stringify(ways));
```

### API

#### splitWays(ways)

Any ways that traverse an intersection are split in two. `!<i>` is appended to the way id where `i` is the index of the split way in the original geometry. Note that `!0` is appended to the way id if there is no split.

#### mergeWays(ways)

Ways that share a node which is not an intersection (only 2 way owners) are merged together. The resulting id is `<wayOne>,<wayTwo>`.

### Input format

- An array of GeoJSON LineString Features
- Each feature must have a `refs` array signifying node Ids of the coordinates that make up the way used for topology construction
- Each feature must have an `id` property representing the OpenStreetMap id of the way
- Each feature must have a `highway` property representing the OpenStreetMap highway tag of the way
- Each feature must have a `oneway` property representing the OpenStreetMap oneway tag of the way
  - the `oneway` property must be normalized to `0`, `1`, or `-1`
  - `0` signifies a bidirectional way
  - `1` signifies a oneway way traveling in coordinate order
  - `-1` signifies a oneway way traveling in reverse coordinate order (this will be normalized to forward order `1`)
  - graph-normalizer will not work with raw OpenStreetMap oneway values such as `yes`, or `no`

### Misc

- All way geometries in the original road network have an equivalent in the normalized graph.
- No intersection ever lies within a normalized way, only at its ends.
- Normalized way ids keep track of the history of transformations that led to it.
- `highway`, `oneway`, `bridge`, `tunnel` and `junction` tags are conserved from the original graph by default.
- `highway`, `bridge`, `tunnel` and `junction` tags can be merged using optional arguments. When merging different tags:
  - `highway` tag is set as `unclassified`
  - `tunnel` tag is set to `yes` i.e. we keep the info that there is a tunnel in the merged way
  - `bridge` tag is set to `yes` i.e. we keep the info that there is a bridge in the merged way
  - `junction` tag is set we keep the info about the junction in the merged way
