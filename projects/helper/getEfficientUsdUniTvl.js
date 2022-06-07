const sdk = require('@defillama/sdk');
const token0 = require('./abis/token0.json');
const token1 = require('./abis/token1.json');
const getReserves = require('./abis/getReserves.json');
const factoryAbi = require('./abis/factory.json');
const { getBlock } = require('./getBlock');

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

const step = 10e3;

function calculateUsdUniTvl(FACTORY, chain, coreAssetRaw, whitelistRaw, coreAssetName, decimals = 18) {
    const whitelist = whitelistRaw.map(t => t.toLowerCase())
    const coreAsset = coreAssetRaw.toLowerCase()
    return async (timestamp, ethBlock, chainBlocks) => {
        const block = await getBlock(timestamp, chain, chainBlocks)

        let pairAddresses;
        const pairLengthRaw = (await sdk.api.abi.call({
            target: FACTORY,
            abi: factoryAbi.allPairsLength,
            chain,
            block
        })).output
        if (pairLengthRaw === null) {
            throw new Error("allPairsLength() failed")
        }
        const prices = {}
        let coreBalance = 0
        const pairLength = Number(pairLengthRaw)
        for (let floor = 0; floor < pairLength; floor += step) {
            const pairNums = Array.from(Array(Number(step)).keys()).map(k=>k+floor)
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
        }
        return {
            [coreAssetName]: (coreBalance) / (10 ** decimals)
        }
    }
};

module.exports = {
    calculateUsdUniTvl,
};
