const { get } = require('../helper/http')
const { call } = require('../helper/chain/ton')
const { transformDexBalances } = require('../helper/portedTokens')


const SCALE_STAKING_ADDRESS = 'EQBNZB91JJX9Ub7KMEAUoQNVcQlCsob5e_WMFbvsML_UoAKD'
const SCALE = "EQBlqsm144Dq6SjbPI4jjZvA1hqTIP3CvHovbIfW_t-SCALE"

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ton: {
    tvl: async () => {
      const pools = await get('https://api.dedust.io/v1/pools')

      return transformDexBalances({
        chain: 'ton',
        data: pools.map(i => ({
          token0: i.left_token_root,
          token1: i.right_token_root,
          token0Bal: i.left_token_reserve,
          token1Bal: i.right_token_reserve,
        }))
      })
    },
    staking: async (api) => {
      const get_staking_data = await call({ target: SCALE_STAKING_ADDRESS, abi: "get_staking_data" })
      return api.add(SCALE, parseInt(get_staking_data[3]))
    }
  }
}
