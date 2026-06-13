const ADDRESSES = require('../helper/coreAssets.json')
const MARKETS = '0xb212b1E9b00aD54fB5419E6231E0b4300dB9F40F'
const VAULT_CORE = '0xB42942DecDEE7ac9b2b1bb4bd2fE6a5DC7ae448f'
const VAULT_USDT = '0xE82A6936CC50EBA10e424843CC348b9794244051'
const TOKEN_CORE = ADDRESSES.core.WCORE
const TOKEN_USDT = ADDRESSES.core.USDT

async function tvl(api) {
    const owners = [MARKETS, VAULT_USDT, VAULT_CORE]
    const tokens = [TOKEN_USDT, TOKEN_CORE]

    return api.sumTokens({ owners, tokens })
}

module.exports = {
    methodology: `Corex Markets TVL includes trader collaterals held in the Markets contract during active trades, plus vaults liquidity that backs trader profits and losses.`,
    core: {
        tvl,
    },
}
