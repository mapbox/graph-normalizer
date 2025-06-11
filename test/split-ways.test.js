

const test = require('tap').test;
const normalizer = require('../');
const fs = require('fs');
const path = require('path');

test('split-ways', (t) => {
    const fixtures = fs.readdirSync(path.join(__dirname, './fixtures/split-ways/'));

    fixtures.forEach((fixture) => {
        const before = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/split-ways/', fixture, 'before')));
        const after = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/split-ways/', fixture, 'after')));

        const result = normalizer.splitWays(before);

        t.deepEqual(result, after, `${fixture  } output matches expected result`);
    });

    t.end();
});
