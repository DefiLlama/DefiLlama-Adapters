const { sumTokens } = require('../helper/chain/starknet')
const { getConfig } = require('../helper/cache')

const market = '0x00000005dd3d2f4429af886cd1a3b08289dbcea99a294197e9eb43b0e0325b4b'

async function tvl(api) {
    const tokens = await getConfig('ekubo', "https://mainnet-api.ekubo.org/tokens")
    return sumTokens({ api, owner: market, tokens: tokens.map(t=>t.l2_token_address) })
}

module.exports = {
    methodology: 'Value of LP in the DEX, includes LPs that are out of range and thus not providing active liquidity',
    starknet: {
        tvl
    },
}