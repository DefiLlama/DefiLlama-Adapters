const { get } = require('../helper/http')
const { transformDexBalances } = require('../helper/portedTokens')
const ADDRESSES = require("../helper/coreAssets.json");


const SCALE_STAKING_ADDRESS = 'EQBNZB91JJX9Ub7KMEAUoQNVcQlCsob5e_WMFbvsML_UoAKD'

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
      const get_staking_data = await get(`https://tonapi.io/v2/blockchain/accounts/${SCALE_STAKING_ADDRESS}/methods/get_staking_data`)
      if (!get_staking_data.success) {
        throw new Error(`Failed to get staking data: ${get_staking_data}`)
      }
      const price_response = await get(`https://tonapi.io/v2/rates?tokens=${ADDRESSES.ton.SCALE}&currencies=ton`)
      const scale_price = price_response.rates[ADDRESSES.ton.SCALE].prices.TON
      return api.add(ADDRESSES.ton.TON, parseInt(get_staking_data.stack[3].num) * scale_price)
    }
  }
}
