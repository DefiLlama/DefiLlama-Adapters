const ADDRESSES = require('../helper/coreAssets.json')
const {sumTokensSharedOwners} = require('../helper/unwrapLPs')

async function eth(timestamp, ethBlock, chainBlocks){
    const block = chainBlocks.ethereum
    const balances = {}
    await sumTokensSharedOwners(balances, [
        "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3",
        "0x92e187a03b6cd19cb6af293ba17f2745fd2357d5",
        ADDRESSES.ethereum.WBTC,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.USDC
    ], ["0x59653E37F8c491C3Be36e5DD4D503Ca32B5ab2f4"], ethBlock)
    return balances
}

async function polygon(timestamp, ethBlock, chainBlocks){
    const block = chainBlocks.polygon
    const balances = {}
    await sumTokensSharedOwners(balances, [
        ADDRESSES.polygon.WBTC,
        ADDRESSES.polygon.USDT,
        ADDRESSES.polygon.USDC,
        ADDRESSES.polygon.WETH_1,
        ADDRESSES.polygon.WMATIC_2,
    ], ["0x3826367A5563eCE9C164eFf9701146d96cC70AD9"], block, "polygon")
    return balances
}

module.exports = {
    hallmarks: [
        [1669766400, "swap contract exploit"]
    ],
    ethereum:{
        tvl:eth
    },
    polygon:{
        tvl:polygon
    }
}