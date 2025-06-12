const test = require('tap').test;
const normalizer = require('../');
const fs = require('fs');
const path = require('path');
const deepEqual = require('deep-equal');

test('merge-ways', (t) => {
    const fixtures = fs.readdirSync(path.join(__dirname, './fixtures/merge-ways/'));

    fixtures.forEach((fixture) => {
        let options = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/merge-ways/', fixture, 'options')));
        if (options === 'undefined') options = undefined;
        const before = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/merge-ways/', fixture, 'before')));
        const after = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/merge-ways/', fixture, 'after')));

        const result = normalizer.mergeWays(before, options);
        deepEqual(result, after, `${fixture  } output matches expected result`);
    });

    t.end();
});
