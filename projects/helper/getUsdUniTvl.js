const sdk = require('@defillama/sdk');

async function requery(results, chain, block, abi) {
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

function sum(balances, token, amount) {
    if (balances[token] === undefined) {
        balances[token] = 0
    }
    balances[token] += Number(amount)
}

function setPrice(prices, address, coreAmount, tokenAmount) {
    if (prices[address] !== undefined) {
        const currentCoreAmount = prices[address][0]
        if (coreAmount < currentCoreAmount) {
            return
        }
    }
    prices[address] = [Number(coreAmount), Number(coreAmount) / Number(tokenAmount)]
}

module.exports = {
    requery,
    setPrice,
    sum
};
