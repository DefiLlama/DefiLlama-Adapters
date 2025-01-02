const { get } = require('./helper/http')
const { transformDexBalances } = require('./helper/portedTokens')

async function tvl() {
  var { pools } = await get('https://api-bridge-mainnet.azurewebsites.net/secretswap_pools/?page=0&size=1000')

  pools.filter(i => +i.total_share > 0).map(i => i.address)
  return transformDexBalances({
    chain: 'secret',
    data: pools.filter(i => +i.total_share > 0).map(i => {
      return {
        token0: i.assets[0].info.token?.contract_addr ?? i.assets[0].info.native_token?.denom ?? i.assets[0].info.native_token?.base_denom,
        token0Bal: i.assets[0].amount,
        token1: i.assets[1].info.token?.contract_addr ?? i.assets[1].info.native_token?.denom ?? i.assets[1].info.native_token?.base_denom,
        token1Bal: i.assets[1].amount,
      }
    }),
  })
}

module.exports = {
  misrepresentedTokens: true,
  secret: {
    tvl
  },
}