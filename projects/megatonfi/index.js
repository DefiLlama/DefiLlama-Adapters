const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http')
const { transformDexBalances, } = require('../helper/portedTokens')
const nullAddress = ADDRESSES.null
const megaAddress = '0:5febe62847dc7296897f3708c7acb92b4c50192425fe6ec77e5f1ffdd3639a3d'

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ton: {
    tvl: async () => {
      const lpInfoList = await get('https://megaton.fi/api/lp/infoList');
      const pools = lpInfoList[0]

      return transformDexBalances({
        chain: 'ton',
        data: pools.map(pool => ({
          token0: pool.token0 ?? nullAddress,
          token1: pool.token1 ?? nullAddress,
          token0Bal: pool.amount0,
          token1Bal: pool.amount1,
        }))
      })
    },
    staking: async () => {
      let mega_vault = "EQD9Z7L2oLpWvW-NZFB9njBGg2JqIE2rpJ_Fcocg9IEQ-EGF"

      const res = await get(`https://tonapi.io/v2/accounts/${mega_vault}/jettons?currencies=mega`);
      const vaultMegaWallet = res.balances.find((data)=> data.jetton.address==megaAddress)

      return {['ton:'+ADDRESSES.ton.MEGA]: vaultMegaWallet.balance}
    }
  }
}

