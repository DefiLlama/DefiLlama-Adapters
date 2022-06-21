const sdk = require("@defillama/sdk");
const token0 = require('../helper/abis/token0.json');
const token1 = require('../helper/abis/token1.json');
const getReserves = require('../helper/abis/getReserves.json');
const factoryAbi = require('../helper/abis/factory.json');

const requery = async (results, chain, block, abi) => {
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

const getVestInstances = async (vestingAddress, chain, startBlock = 0, endBlock = 0) => {
    let tokenAddresses;

    const logs = (
        await sdk.api.util.getLogs({
            keys: [],
            chain,
            fromBlock: startBlock,
            toBlock: endBlock,
            target: vestingAddress,
            topic: 'OnTokenLock(uint256,address,address,address,uint256,uint256)'
        })
    ).output;

    tokenAddresses = logs
        .map((log) => {
            if (typeof log === 'string') return log;
            return {
                token: `0x${log.topics[2].slice(26)}`,
                instance: `0x${log.data.slice(64 - 40 + 2, 64 + 2)}`,
                isLP: false, // TODO: detect if locked token is LP token
            }
        })

    return tokenAddresses;
}

const getLockerPairAddresses = async (lockerAddress, chain, startBlock = 0, endBlock = 0) => {
    let pairAddresses;

    const logs = (
        await sdk.api.util.getLogs({
            keys: [],
            chain,
            fromBlock: startBlock,
            toBlock: endBlock,
            target: lockerAddress,
            topic: 'OnTokenLock(uint256,address,address,uint256,uint256)',
        })
    ).output;
  
    pairAddresses = logs
        // sometimes the full log is emitted
        .map((log) =>
          typeof log === 'string' ? log : `0x${log.topics[2].slice(26)}`
        )
        // lowercase
        .map((pairAddress) => pairAddress.toLowerCase());

    return pairAddresses;
}

const getSwapPairAddresses = async (factory, chain, useMulticall = false) => {
    let pairAddresses;
    const pairLength = (await sdk.api.abi.call({
        target: factory,
        abi: factoryAbi.allPairsLength,
        chain,
    })).output
    if (pairLength === null) {
        throw new Error("allPairsLength() failed", factory)
    }
    const pairNums = Array.from(Array(Number(pairLength)).keys())
    const pairs = (await sdk.api.abi.multiCall({
        abi: factoryAbi.allPairs,
        chain,
        calls: pairNums.map(num => ({
            target: factory,
            params: [num]
        })),
    })).output
    await requery(pairs, chain, undefined, factoryAbi.allPairs);
    pairAddresses = pairs.map(result => result.output.toLowerCase());

    return pairAddresses;
}

module.exports = {
    getSwapPairAddresses,
    getLockerPairAddresses,
    getVestInstances
}