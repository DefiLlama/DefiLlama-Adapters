const { queryV1Beta1 } = require('../helper/chain/cosmos')
const { getDenomBalance } = require('../helper/chain/cosmos')
const { transformBalances } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')

const poolURI = 'liquidity/v1beta1/pools'
const chain = 'bostrom'

async function tvl() {
  let paginationKey
  const balances = {}

  do {
    const data = await queryV1Beta1({ chain, url: poolURI, paginationKey })

    paginationKey = data.pagination.next_key;
    for (const pool of data.pools) {
      const base_coin_amount = await getDenomBalance({denom: pool.reserve_coin_denoms[0], owner: pool.reserve_account_address, chain: chain})
      const quote_coin_amount = await getDenomBalance({denom: pool.reserve_coin_denoms[1], owner: pool.reserve_account_address, chain: chain})
      sdk.util.sumSingleBalance(balances, pool.reserve_coin_denoms[0], base_coin_amount)
      sdk.util.sumSingleBalance(balances,pool.reserve_coin_denoms[1], quote_coin_amount)
    }
  } while (paginationKey)
  return transformBalances(chain, balances)
}

module.exports = {
  timetravel: false,
  methodology: "Counts the liquidity on all pools. ",
  bostrom: {
    tvl
  }
}