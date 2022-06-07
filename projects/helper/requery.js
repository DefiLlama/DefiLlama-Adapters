const sdk = require('@defillama/sdk');

async function requery(resultsRaw, chain, block, abi) {
    const results = resultsRaw.output;
    if (results.some(r => !r.success)) {
        const failed = results.map((r, i) => [r, i]).filter(r => !r[0].success)
        const newResults = await sdk.api.abi
            .multiCall({
                abi,
                chain,
                calls: failed.map((f) => f[0].input),
                block,
            }).then(({ output }) => output);
        failed.forEach((f, i) => {
            results[f[1]] = newResults[i]
        })
    }
}

module.exports = {
    requery
}