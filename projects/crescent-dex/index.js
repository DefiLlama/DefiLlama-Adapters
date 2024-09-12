const { queryV1Beta1 } = require('../helper/chain/cosmos')
const { transformBalances } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')

const poolURI = 'liquidity/v1beta1/pools'
const chain = 'crescent'

async function tvl() {
  let paginationKey
  const balances = {}

  do {
    const data = await queryV1Beta1({ chain, url: poolURI, paginationKey })

    paginationKey = data.pagination.next_key;
    for (const pool of data.pools) {
      sdk.util.sumSingleBalance(balances, pool.balances.base_coin.denom, pool.balances.base_coin.amount)
      sdk.util.sumSingleBalance(balances, pool.balances.quote_coin.denom, pool.balances.quote_coin.amount)
    }
  } while (paginationKey)
  return transformBalances(chain, balances)
}

module.exports = {
  timetravel: false,
  methodology: "Counts the liquidity on all pools. ",
  crescent: {
    tvl
  },
  deadFrom: '2024-05-01',
  hallmarks: [[1713052800, 'Sunset of Crescent Network']]
}