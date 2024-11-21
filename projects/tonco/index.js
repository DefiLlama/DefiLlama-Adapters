const { cachedGraphQuery } = require('../helper/cache');
const { post } = require('../helper/http')
const { transformDexBalances } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')
const { ethers } = require("ethers")

const API_URL = 'https://indexer.tonco.io';

const poolsQuery = `
  {
    pools {
      address
      jetton0 {
        bounceableAddress
        decimals
      }
      jetton1 {
        bounceableAddress
        decimals
      }
      totalValueLockedJetton0
      totalValueLockedJetton1
    }
  }
`

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ton: {
    tvl: async () => {

      const result = await cachedGraphQuery('tonco-swap', API_URL, poolsQuery)

      sdk.log(result)

      return transformDexBalances({
        chain: 'ton',
        data: result.pools.map(pool => ({
          token0: pool.jetton0.bounceableAddress,
          token1: pool.jetton1.bounceableAddress,
          token0Bal: Number(ethers.parseUnits(String(pool.totalValueLockedJetton0.toFixed(pool.jetton0.decimals)), parseInt(pool.jetton0.decimals))),
          token1Bal: Number(ethers.parseUnits(String(pool.totalValueLockedJetton1.toFixed(pool.jetton1.decimals)), parseInt(pool.jetton1.decimals))),
        }))
      })
    }
  }
}
