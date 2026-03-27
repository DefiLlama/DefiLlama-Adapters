const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http')
const { getConfig } = require('../helper/cache')
const { addJettonBalances } = require('../helper/chain/ton')

const megaAddress = '0:5febe62847dc7296897f3708c7acb92b4c50192425fe6ec77e5f1ffdd3639a3d'

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ton: {
    tvl: async (api) => {
      const lpInfoList = await getConfig('megatonfi', 'https://megaton.fi/api/lp/infoList');
      const pools = lpInfoList[0]

      const tokenToOwners = {}
      for (const pool of pools) {
        for (const token of [pool.token0, pool.token1]) {
          if (!token) continue
          if (!tokenToOwners[token]) tokenToOwners[token] = []
          tokenToOwners[token].push(pool.address)
        }
      }

      for (const [jettonAddress, addresses] of Object.entries(tokenToOwners)) {
        await addJettonBalances({ api, jettonAddress, addresses, chunkSize: 5 })
      }
    },
    staking: async () => {
      const mega_vault = "EQD9Z7L2oLpWvW-NZFB9njBGg2JqIE2rpJ_Fcocg9IEQ-EGF"
      const res = await get(`https://tonapi.io/v2/accounts/${mega_vault}/jettons?currencies=mega`);
      const vaultMegaWallet = res.balances.find((data) => data.jetton.address == megaAddress)
      return { ['ton:' + ADDRESSES.ton.MEGA]: vaultMegaWallet.balance }
    }
  }
}
