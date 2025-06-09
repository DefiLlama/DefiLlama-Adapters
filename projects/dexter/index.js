const { queryContract } = require("../helper/chain/cosmos");
const { transformDexBalances } = require("../helper/portedTokens");

const chainConfigs = {
  persistence: {
    contract: 'persistence1k8re7jwz6rnnwrktnejdwkwnncte7ek7gt29gvnl3sdrg9mtnqkstujtpg'
  },
  babylon: {
    contract: 'bbn18rdj3asllguwr6lnyu2sw8p8nut0shuj3sme27ndvvw4gakjnjqqczzj4x'
  }
}

async function tvl(api) {
    const chain = api.chain
    const config = chainConfigs[chain]
    const { contract } = config
    const poolConfig = await queryContract({ chain, contract, data: { config: {} }, });
    let poolId = 1
    const data = []
    do {
      const { assets, pool_type } = await queryContract({ chain, contract, data: { get_pool_by_id: { pool_id: '' + poolId } }, })
        assets.forEach(({ info: { native_token: { denom }}, amount }) => api.add(denom, amount))
      poolId++
    } while (poolId < +poolConfig.next_pool_id)
    return transformDexBalances({ chain, data, balances: api.getBalances()})
}

module.exports = {
  timetravel: false,
  // misrepresentedTokens: true,
  methodology: `Counts the liquidity on all AMM pools`,
  start: '2023-03-26', // "2023-03-26" UTC
  persistence: {
    tvl
  },
  babylon: {
    tvl
  }
}
