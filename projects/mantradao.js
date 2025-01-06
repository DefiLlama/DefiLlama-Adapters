const { queryContract } = require("./helper/chain/cosmos");

const coreAssets = require('./helper/coreAssets.json');

const chain = 'mantra'
const mantraPoolManager = 'mantra1466nf3zuxpya8q9emxukd7vftaf6h4psr0a07srl5zw74zh84yjqagspfm'

/**
 * Get all pools in the DEX
 * @returns {Promise<Array<{pool_info: {pool_identifier: string, asset_denoms: string[], lp_denom: string, asset_decimals: number[], assets: Array<{denom: string, amount: string}>}, total_share: {denom: string, amount: string}}>>}
 */
async function getDexPools() {
  const response = await queryContract({
    chain,
    contract: mantraPoolManager,
    data: {
      pools: {}
    }
  })
  return response.pools
}

async function tvl(api) {
  const allPools = await getDexPools()
  allPools.forEach(pool => {
    // For now, we only counts pools with OM
    if (pool.pool_info.asset_denoms.includes(coreAssets.mantra.OM)) {
      pool.pool_info.assets.forEach(asset => {
        api.add(asset.denom, asset.amount)
      })
    }
  })
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Counts the liquidity on MANTRA Chain AMM pools",
  mantra: {
    tvl
  }
}
