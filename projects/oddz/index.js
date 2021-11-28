const sdk = require('@defillama/sdk');
async function getTotalCollateral(pools, chain, block) {
    const balances = {};
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
const bscPools = [
    // pool, token, representation
    ['0x636f9d2Bb973D2E54d2577b9976DedFDc21E6672', '0xcd40f2670cf58720b694968698a5514e924f742d', 'bsc:0xcd40f2670cf58720b694968698a5514e924f742d'], // sODDZ
    ['0x3c2c77353E2F6AC1578807b6b2336Bf3a3CbB014', '0xcd40f2670cf58720b694968698a5514e924f742d', 'bsc:0xcd40f2670cf58720b694968698a5514e924f742d'], // sODDZ
    ['0x3c2c77353E2F6AC1578807b6b2336Bf3a3CbB014', '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 'bsc:0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'], // ODDZ-BNB
    ['0x99f29c537c70897f60c9774d3f13bd081D423467', '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', 'bsc:0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'], // oUSD
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
        bsc(timestamp, block, chainBlocks),
    ]).then(poolBalances => poolBalances.forEach(pool=>mergeBalances(balances, pool)))
    return balances
}

module.exports = {
    bsc: {
        tvl: bsc,
    },
    tvl
}
