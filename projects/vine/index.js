const sdk = require('@defillama/sdk')
const { transformBalances, } = require('../helper/portedTokens')

async function getTVL() {
    let balances = {}
    let balance = await sdk.api.eth.getBalance({ target: "0x1882560361578F2687ddfa2F4CEcca7ae2e614FD", chain: "sapphire" })

    balances = {
        'sapphire:0x8Bc2B030b299964eEfb5e1e0b36991352E56D2D3': balance.output, 
    }
    return transformBalances("sapphire", balances)
}

module.exports = {
    start: 1706475600,
    sapphire: {
        tvl: getTVL,
    },
}
