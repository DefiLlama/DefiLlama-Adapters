const sdk = require('@defillama/sdk');
const token0 = 'address:token0'
const token1 = 'address:token1'
const getReserves = 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'
const factoryAbi = require('../abis/factory.json');

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

function calculateUsdSoulTvl(FACTORY, chain, coreAssetRaw, whitelistRaw, coreAssetName, decimals = 18) {
    const whitelist = whitelistRaw.map(t => t.toLowerCase())
    const coreAsset = coreAssetRaw.toLowerCase()
    return async (timestamp, ethBlock, {[chain]: block}) => {

        let pairAddresses;
        const pairLength = (await sdk.api.abi.call({
            target: FACTORY,
            abi: factoryAbi.totalPairs,
            chain,
            block
        })).output
        if (pairLength === null) {
            throw new Error("totalPairs() failed")
        }
        const pairNums = Array.from(Array(Number(pairLength)).keys())
        {
            const pairs = (await sdk.api.abi.multiCall({
                abi: factoryAbi.allPairs,
                chain,
                calls: pairNums.map(num => ({
                    target: FACTORY,
                    params: [num]
                })),
                block
            })).output
            await requery(pairs, chain, block, factoryAbi.allPairs);
            pairAddresses = pairs.map(result => result.output.toLowerCase())
        }

        const [token0Addresses, token1Addresses, reserves] = await Promise.all([
            sdk.api.abi
                .multiCall({
                    abi: token0,
                    chain,
                    calls: pairAddresses.map((pairAddress) => ({
                        target: pairAddress,
                    })),
                    block,
                })
                .then(({ output }) => output),
            sdk.api.abi
                .multiCall({
                    abi: token1,
                    chain,
                    calls: pairAddresses.map((pairAddress) => ({
                        target: pairAddress,
                    })),
                    block,
                })
                .then(({ output }) => output),
            sdk.api.abi
                .multiCall({
                    abi: getReserves,
                    chain,
                    calls: pairAddresses.map((pairAddress) => ({
                        target: pairAddress,
                    })),
                    block,
                }).then(({ output }) => output),
        ]);
        await requery(token0Addresses, chain, block, token0);
        await requery(token1Addresses, chain, block, token1);
        await requery(reserves, chain, block, getReserves);

        const pairs = {};
        // add token0Addresses
        token0Addresses.forEach((token0Address) => {
            const tokenAddress = token0Address.output.toLowerCase();

            const pairAddress = token0Address.input.target.toLowerCase();
            pairs[pairAddress] = {
                token0Address: tokenAddress,
            }
        });

        // add token1Addresses
        token1Addresses.forEach((token1Address) => {
            const tokenAddress = token1Address.output.toLowerCase();
            const pairAddress = token1Address.input.target.toLowerCase();
            pairs[pairAddress] = {
                ...(pairs[pairAddress] || {}),
                token1Address: tokenAddress,
            }
        });

        const balances = {}
        let coreBalance = 0
        const prices = {}
        const list = []
        for (let i = 0; i < reserves.length; i++) {
            const pairAddress = reserves[i].input.target.toLowerCase();
            const pair = pairs[pairAddress];
            const token0Address = pair.token0Address.toLowerCase()
            const token1Address = pair.token1Address.toLowerCase()
            const reserveAmounts = reserves[i].output
            if (token0Address === coreAsset) {
                coreBalance += Number(reserveAmounts[0]) * 2
                if (whitelist.includes(token1Address)) {
                    setPrice(prices, token1Address, reserveAmounts[0], reserveAmounts[1])
                }
                list.push([pairAddress, Number(reserveAmounts[0]), reserveAmounts])
            } else if (token1Address === coreAsset) {
                coreBalance += Number(reserveAmounts[1]) * 2
                if (whitelist.includes(token0Address)) {
                    setPrice(prices, token0Address, reserveAmounts[1], reserveAmounts[0])
                }
            } else {
                const whitelistedToken0 = whitelist.find(t => t === token0Address)
                const whitelistedToken1 = whitelist.find(t => t === token1Address)
                if (whitelistedToken0 !== undefined) {
                    sum(balances, whitelistedToken0, Number(reserveAmounts[0]) * 2)
                } else if (whitelistedToken1 !== undefined) {
                    sum(balances, whitelistedToken1, Number(reserveAmounts[1]) * 2)
                }
            }
        }
        Object.entries(balances).forEach(([address, amount]) => {
            const price = prices[address];
            if (price !== undefined) {
                coreBalance += price[1] * (amount ?? 0)
            }
        })
        return {
            [coreAssetName]: (coreBalance) / (10 ** decimals)
        }
    }
}

module.exports = {
    calculateUsdSoulTvl,
};
