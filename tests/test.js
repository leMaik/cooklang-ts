const fs = require('node:fs/promises');
const assert = require('node:assert');
const YAML = require('yaml');
const cooklang = require('../dist/index.js');

function replaceUndefinedWithString(item) {
    switch (item.type) {
        case 'ingredient':
            return {
                type: 'ingredient',
                name: item.name,
                quantity: item.quantity || '',
                units: item.units || '',
            }
        case 'cookware':
            return {
                type: 'cookware',
                name: item.name,
                quantity: item.quantity || '',
            }
        case 'timer':
            return {
                type: 'timer',
                name: item.name || '',
                quantity: item.quantity || '',
                units: item.units || '',
            }
        default:
            return item;
    }
}

(async () => {
    const testsFile = await fs.readFile('./tests/canonical.yaml', 'utf-8');

    const tests = Object.entries(YAML.parse(testsFile).tests);

    console.log(`Running tests\n`);

    let passed = 0;

    for ([testName, test] of tests) {
        console.log(testName);

        const recipe = new cooklang.Recipe(test.source);

        const steps = recipe.steps.map(s => s.map(i => replaceUndefinedWithString(i)));

        const metadataPassed = deepEqual(recipe.metadata, Array.isArray(test.result.metadata) ? {} : test.result.metadata);
        const stepsPassed = deepEqual(steps, test.result.steps);

        if (metadataPassed) console.log(' - Metadata: PASS');
        else console.log(' - Metadata: FAIL');

        if (stepsPassed) console.log(' -    Steps: PASS');
        else { console.log(' -    Steps: FAIL'); console.log(JSON.stringify(steps, null, '\t')); console.log(JSON.stringify(test.result.steps, null, '\t')); }

        if (metadataPassed && stepsPassed) passed++;

        console.log('');
    }

    console.log('Tests finished:');
    console.log(' - Passed: ' + passed);
    console.log(' - Failed: ' + (tests.length - passed));
    console.log(' -  Total: ' + tests.length)
})();

function deepEqual(a, b) {
    try {
        assert.deepEqual(a, b);
    } catch (error) {
        if (error.name == 'AssertionError') {
            return false;
        }

        throw error;
    }

    return true;
}