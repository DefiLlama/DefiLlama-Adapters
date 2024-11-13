const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvlPolygon(time, ethB, { polygon: block }) {
    const escrows = ["0xCf311a6606c909Cc5E048FE1f3FF1e63dEec6a26", "0x4fF4C17F24d03Faf9d5097D7E71310AeF71a0f70", "0x9C5dA47ED0281aF302ED1E77a1B961ed980d5385"]
    const tokens = [
        ADDRESSES.polygon.WETH_1, //weth
        ADDRESSES.polygon.DAI, //dai
        ADDRESSES.polygon.USDC, //usdc
        ADDRESSES.polygon.USDT, //usdt
        "0x2e1AD108fF1D8C782fcBbB89AAd783aC49586756", //tusd
    ]
    return sumTokens2({ owners: escrows, tokens, chain: 'polygon', block, })
}

async function tvlKava(time, ethB, { kava: block }) {
    const escrows = [
        "0x858feeb9D751A07aF2D7b5ad7fa996B30261a891",
        "0x4dA60d2646a8ed5461457012f5cd7b87905E9e55",
        "0xEc12AB0306A3bbDa93aACC2BE931F8A8343bCEA3"
    ]
    const tokens = [
        ADDRESSES.moonriver.USDC, //weth
        ADDRESSES.shiden.ETH, //dai
        ADDRESSES.telos.ETH, //usdc
        ADDRESSES.moonriver.USDT, //usdt
    ]
    return sumTokens2({ owners: escrows, tokens, chain: 'kava', block, })
}
module.exports = {
    methodology: `Gets the tokens on escrows for Polygon and Kava`,
    polygon: {
        tvl: tvlPolygon
    },
    kava: {
        tvl: tvlKava
    }
}