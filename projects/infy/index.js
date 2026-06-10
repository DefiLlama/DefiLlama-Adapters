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
        "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d", //weth
        "0x765277eebeca2e31912c9946eae1021199b39c61", //dai
        "0xfa9343c3897324496a05fc75abed6bac29f8a40f", //usdc
        "0xb44a9b6905af7c801311e8f4e76932ee959c663c", //usdt
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