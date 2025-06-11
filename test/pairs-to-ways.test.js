

const test = require('tap').test;
const pairsToWays = require('../lib/pairs-to-ways');
const fs = require('fs');
const path = require('path');
const deepEqual = require('deep-equal');

const linestring = require('turf-linestring');


test('pairs-to-ways', (t) => {
    const before = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/pairs-to-ways/', 'before')));
    const after = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/pairs-to-ways/', 'after')));

    const result = pairsToWays(before);

    deepEqual(result, after, 'output matches expected result');
    t.end();
});

test('pairs-to-ways second test', (t) => {
    let before = [{'coords': [[-73.652215, 40.624132], [-73.652344, 40.62412]], 'ids': ['2982064778', '2982064775']}, {'coords': [[-73.652344, 40.62412], [-73.652446, 40.624124]], 'ids': ['2982064775', '2982064777']}, {'coords': [[-73.652446, 40.624124], [-73.652537, 40.624144]], 'ids': ['2982064777', '261408719']}, {'coords': [[-73.652537, 40.624144], [-73.654897, 40.624816]], 'ids': ['261408719', '261386882']}];
    let after = [linestring([[-73.652215, 40.624132], [-73.652344, 40.62412], [-73.652446, 40.624124], [-73.652537, 40.624144], [-73.654897, 40.624816]], {refs: ['2982064778', '2982064775', '2982064777', '261408719', '261386882']})];


    let result = pairsToWays(before);

    deepEqual(result, after, 'output matches expected result');

    before = [{'coords': [[-73.652215, 40.624132], [-73.652344, 40.62412]], 'ids': ['2982064778', '2982064775']}];
    after = [linestring([[-73.652215, 40.624132], [-73.652344, 40.62412]], {refs: ['2982064778', '2982064775']})];

    result = pairsToWays(before);

    deepEqual(result, after, 'short output matches expected result');

    t.end();
});
