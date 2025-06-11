

const test = require('tap').test;
const indexWay = require('../lib/index-way');
const path = require('path');

const way = require(path.join(__dirname, 'fixtures', 'index-way', 'way.json'));
const wayZ13 = require(path.join(__dirname, 'fixtures', 'index-way', 'way-z13.json'));
const result = require(path.join(__dirname, 'fixtures', 'index-way', 'result.json'));


test('index-way', (t) => {
    const r = indexWay(way);
    t.equals(Object.keys(r).length, 4, '4 tiles have segments');
    t.same(r, result);
    t.end();
});

test('index-way z13 with way and wayZ13', (t) => {
    const r = indexWay(way, 13);
    t.equals(Object.keys(r).length, 1, 'only one tile returned');
    const r2 = indexWay(wayZ13, 13);
    t.equals(Object.keys(r2).length, 1, 'way in 2 z13 tiles.');
    t.end();
});

const sampleWay = {
    'type': 'Feature',
    'properties': {'refs': ['2982064778', '2982064775', '2982064777', '261408719', '261386882']},
    'geometry': {
        'type': 'LineString',
        'coordinates': [[-73.652215, 40.624132], [-73.652344, 40.62412], [-73.652446, 40.624124], [-73.652537, 40.624144], [-73.654897, 40.624816]]
    }
};

const indexedWay = {'03201011120': [{'coords': [[-73.652215, 40.624132], [-73.652344, 40.62412]], 'ids': ['2982064778', '2982064775']}, {'coords': [[-73.652344, 40.62412], [-73.652446, 40.624124]], 'ids': ['2982064775', '2982064777']}, {'coords': [[-73.652446, 40.624124], [-73.652537, 40.624144]], 'ids': ['2982064777', '261408719']}, {'coords': [[-73.652537, 40.624144], [-73.654897, 40.624816]], 'ids': ['261408719', '261386882']}], '03201011121': [{'coords': [[-73.652215, 40.624132], [-73.652344, 40.62412]], 'ids': ['2982064778', '2982064775']}]};

test('index-way sampleWay z11', (t) => {
    const r = indexWay(sampleWay, 11);
    t.same(r, indexedWay, 'indexed ways are accurate');
    t.end();
});
