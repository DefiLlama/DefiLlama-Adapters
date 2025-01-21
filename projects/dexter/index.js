const { queryContract } = require("../helper/chain/cosmos");
const { transformDexBalances } = require("../helper/portedTokens");

async function tvl(api) {
  const contract = 'persistence1k8re7jwz6rnnwrktnejdwkwnncte7ek7gt29gvnl3sdrg9mtnqkstujtpg'
  const chain = api.chain
  const config = await queryContract({ chain, contract, data: { config: {} }, });
  let poolId = 1
  const data = []
  do {
    const { assets, pool_type } = await queryContract({ chain, contract, data: { get_pool_by_id: { pool_id: '' + poolId } }, })
    // if (pool_type.stable_swap) {
      assets.forEach(({ info: { native_token: { denom }}, amount }) => api.add(denom, amount))
    // } else {
    //   data.push({
    //     token0: assets[0].info.native_token.denom,
    //     token0Bal: assets[0].amount,
    //     token1: assets[1].info.native_token.denom,
    //     token1Bal: assets[1].amount,
    //   })
    // }
    poolId++
  } while (poolId < +config.next_pool_id)
  return transformDexBalances({ chain, data, balances: api.getBalances()})

}

module.exports = {
  timetravel: false,
  // misrepresentedTokens: true,
  methodology: `Counts the liquidity on all AMM pools`,
  start: '2023-03-26', // "2023-03-26" UTC
  persistence: {
    tvl
  }
}
