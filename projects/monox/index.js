const {sumTokensSharedOwners} = require('../helper/unwrapLPs')

async function eth(timestamp, ethBlock, chainBlocks){
    const block = chainBlocks.ethereum
    const balances = {}
    await sumTokensSharedOwners(balances, [
        "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3",
        "0x92e187a03b6cd19cb6af293ba17f2745fd2357d5",
        "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        "0xdac17f958d2ee523a2206206994597c13d831ec7",
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
    ], ["0x59653E37F8c491C3Be36e5DD4D503Ca32B5ab2f4"], ethBlock)
    return balances
}

async function polygon(timestamp, ethBlock, chainBlocks){
    const block = chainBlocks.polygon
    const balances = {}
    await sumTokensSharedOwners(balances, [
        "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
        "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
        "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
        "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    ], ["0x3826367A5563eCE9C164eFf9701146d96cC70AD9"], block, "polygon")
    return balances
}

module.exports = {
    ethereum:{
        tvl:eth
    },
    polygon:{
        tvl:polygon
    }
}