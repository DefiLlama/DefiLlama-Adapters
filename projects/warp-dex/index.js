const { queryV1Beta1 } = require('../helper/chain/cosmos')
const { getDenomBalance } = require('../helper/chain/cosmos')
const { transformDexBalances } = require('../helper/portedTokens')

const poolURI = 'liquidity/v1beta1/pools'
const chain = 'bostrom'

async function tvl() {
  let paginationKey
  const data = []

  do {
    const { pools, pagination } = await queryV1Beta1({ chain, url: poolURI, paginationKey })
    paginationKey = pagination.next_key;
    for (const pool of pools) {
      const base_coin_amount = await getDenomBalance({ denom: pool.reserve_coin_denoms[0], owner: pool.reserve_account_address, chain })
      const quote_coin_amount = await getDenomBalance({ denom: pool.reserve_coin_denoms[1], owner: pool.reserve_account_address, chain })
      data.push({
        token0: pool.reserve_coin_denoms[0],
        token1: pool.reserve_coin_denoms[1],
        token0Bal: base_coin_amount,
        token1Bal: quote_coin_amount,
      })
    }
  } while (paginationKey)
  return transformDexBalances({ chain, data, blacklistedTokens: [
    'ibc/4B322204B4F59D770680FE4D7A565DDC3F37BFF035474B717476C66A4F83DD72', // DSM giving invalid values for some reason, incorrect decimals?
  ] })
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Counts the liquidity on all pools. ",
  bostrom: {
    tvl
  }
}