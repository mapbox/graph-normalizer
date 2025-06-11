

const Benchmark = require('benchmark');
const normalizer = require('../');
const fs = require('fs');
const path = require('path');

const small = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/small.json')));
const medium = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/medium.json')));
const large = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/large.json')));

new Benchmark.Suite('merge-ways')
    .add('merge-ways # small', () => {
        normalizer.mergeWays(small);
    })
    .add('merge-ways # medium', () => {
        normalizer.mergeWays(medium);
    })
    .add('merge-ways # large', () => {
        normalizer.mergeWays(large);
    })
    .on('cycle', (event) => {
        console.log(String(event.target));
    })
    .run();
