const ADDRESSES = require('../helper/coreAssets.json')
const tokenAddress = {
    USDB: ADDRESSES.blast.USDB,
    WETH: ADDRESSES.blast.WETH,
    ETH: ADDRESSES.null
};

const collection = {
    genesis: "0x5066A1975BE96B777ddDf57b496397efFdDcB4A9",
    explorer: "0xFB0B3C31eAf58743603e8Ee1e122547EC053Bf18",
    strategy: "0x73E75E837e4F3884ED474988c304dE8A437aCbEf"
}

const agentRegistry = "0x12F0A3453F63516815fe41c89fAe84d218Af0FAF"
const balanceFetcher = "0x3f8Dc480BEAeF711ecE5110926Ea2780a1db85C5"

const uniV2Lp = {
    thruster: '0x12c69BFA3fb3CbA75a1DEFA6e976B87E233fc7df',
    blasterswap: '0x3b5d3f610Cc3505f4701E9FB7D0F0C93b7713adD',
    ring: '0x9BE8a40C9cf00fe33fd84EAeDaA5C4fe3f04CbC3'
}

const uniV3NftManager = {
    blasterswap: '0xa761d82F952e9998fE40a6Db84bD234F39122BAD',
    blasterswap2: '0x1e60C4113C86231Ef4b5B0b1cbf689F1b30e7966',
    thruster: '0x434575EaEa081b735C985FA9bf63CD7b87e227F9',
}

module.exports = {
    tokenAddress,
    collection,
    agentRegistry,
    uniV2Lp,
    uniV3NftManager,
    balanceFetcher
}
