

const Benchmark = require('benchmark');
const normalizer = require('../');
const fs = require('fs');
const path = require('path');

const small = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/small.json')));
const medium = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/medium.json')));
const large = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/large.json')));

new Benchmark.Suite('split-ways')
    .add('split-ways # small', () => {
        normalizer.splitWays(small);
    })
    .add('split-ways # medium', () => {
        normalizer.splitWays(medium);
    })
    .add('split-ways # large', () => {
        normalizer.splitWays(large);
    })
    .on('cycle', (event) => {
        console.log(String(event.target));
    })
    .run();
