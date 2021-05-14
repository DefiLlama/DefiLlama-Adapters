const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const BN = require("bignumber.js");

async function getTotalCollateral(pools, chain, block) {
    const balances = {};
    // Need to be called separately because BUSDT rejects when multicalled on BSC
    await Promise.all(pools.map(pool =>
        sdk.api.erc20.balanceOf({
            target: pool[1],
            owner: pool[0],
            chain,
            block
        }).then(result => sdk.util.sumSingleBalance(balances, pool[2], result.output))
    ))
    return balances
}

const ethPools = [
    // pool, currency
    ['0x919a35A4F40c479B3319E3c3A2484893c06fd7de', '0xef9cd7882c067686691b6ff49e650b43afbbcc6b', '0xef9cd7882c067686691b6ff49e650b43afbbcc6b'], // FNX
    ['0xff60d81287BF425f7B2838a61274E926440ddAa6', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'], // USDC
    ['0xff60d81287BF425f7B2838a61274E926440ddAa6', '0xdac17f958d2ee523a2206206994597c13d831ec7', '0xdac17f958d2ee523a2206206994597c13d831ec7'], // USDT
    ['0x6f88e8fbF5311ab47527f4Fb5eC10078ec30ab10', '0x853d955acef822db058eb8505911ed77f175b99e', '0x853d955acef822db058eb8505911ed77f175b99e'] // FRAX
]

async function eth(_timestamp, block, chainBlocks) {
    return getTotalCollateral(ethPools, 'ethereum', block)
}

const wanPools = [
    // pool, currency, ethereum counterpart
    ['0xe96E4d6075d1C7848bA67A6850591a095ADB83Eb', '0xC6F4465A6a521124C8e3096B62575c157999D361', '0xef9cd7882c067686691b6ff49e650b43afbbcc6b'], // FNX
    ['0x297FF55afEF50C9820d50eA757B5bEBa784757AD', '0x11e77E27Af5539872efEd10abaA0b408cfd9fBBD', '0xdac17f958d2ee523a2206206994597c13d831ec7'], // USDT
]
async function wan(timestamp, ethBlock, chainBlocks) {
    const { block } = await sdk.api.util.lookupBlock(timestamp, {
        chain: 'wan'
    })
    return getTotalCollateral(wanPools, 'wan', block)
}

const bscPools = [
    // pool, token, representation
    ['0xf2E1641b299e60a23838564aAb190C52da9c9323', '0xdfd9e2a17596cad6295ecffda42d9b6f63f7b5d5', 'bsc:0xdfd9e2a17596cad6295ecffda42d9b6f63f7b5d5'], //FNX
    ['0xA3f70ADd496D2C1c2C1Be5514A5fcf0328337530', '0xe9e7cea3dedca5984780bafc599bd69add087d56', 'bsc:0xe9e7cea3dedca5984780bafc599bd69add087d56'], //BUSD
    ['0xA3f70ADd496D2C1c2C1Be5514A5fcf0328337530', '0x55d398326f99059fF775485246999027B3197955', 'bsc:0x55d398326f99059fF775485246999027B3197955'], //USDT
]

async function bsc(_timestamp, block, chainBlocks) {
    return getTotalCollateral(bscPools, 'bsc', chainBlocks['bsc'])
}

function mergeBalances(balances, balancesToMerge) {
    Object.entries(balancesToMerge).forEach(balance => {
        sdk.util.sumSingleBalance(balances, balance[0], balance[1])
    })
}
async function tvl(timestamp, block, chainBlocks) {
    const balances = {}
    await Promise.all([
        eth(timestamp, block, chainBlocks),
        bsc(timestamp, block, chainBlocks),
        wan(timestamp, block, chainBlocks),
    ]).then(poolBalances => poolBalances.forEach(pool=>mergeBalances(balances, pool)))
    return balances
}

module.exports = {
    ethereum: {
        tvl: eth,
    },
    bsc: {
        tvl: bsc,
    },
    wan: {
        tvl: wan,
    },
    tvl
}

