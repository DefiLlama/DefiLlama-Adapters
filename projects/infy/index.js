const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvlPolygon(time, ethB, { polygon: block }) {
    const escrows = ["0xCf311a6606c909Cc5E048FE1f3FF1e63dEec6a26", "0x4fF4C17F24d03Faf9d5097D7E71310AeF71a0f70", "0x9C5dA47ED0281aF302ED1E77a1B961ed980d5385"]
    const tokens = [
        "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", //weth
        "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", //dai
        "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", //usdc
        "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", //usdt
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
        "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D", //weth
        "0x765277EebeCA2e31912C9946eAe1021199B39C61", //dai
        "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f", //usdc
        "0xB44a9B6905aF7c801311e8F4E76932ee959c663C", //usdt
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