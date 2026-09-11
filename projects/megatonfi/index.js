const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http')
const { getConfig } = require('../helper/cache')
const { addJettonBalances } = require('../helper/chain/ton')

const megaAddress = '0:5febe62847dc7296897f3708c7acb92b4c50192425fe6ec77e5f1ffdd3639a3d'

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  isHeavyProtocol: true,
  ton: {
    tvl: async (api) => {
      const lpInfoList = await getConfig('megatonfi', 'https://megaton.fi/api/lp/infoList');
      const pools = lpInfoList[0]
      const coreAssets = new Set(Object.values(ADDRESSES.ton))

      const tokenToOwners = {}
      for (const pool of pools) {
        if (coreAssets.has(pool.token0))
          addToTokenMap(pool.address, pool.token0)
        else if (coreAssets.has(pool.token1))
          addToTokenMap(pool.address, pool.token1)
        else
          console.warn(`Neither token0 nor token1 of pool ${pool.address} is a core asset, skipping.`)
      }

      function addToTokenMap(poolAddress, token) {
        if (!tokenToOwners[token]) tokenToOwners[token] = []
        tokenToOwners[token].push(poolAddress)
      }

      for (const [jettonAddress, addresses] of Object.entries(tokenToOwners)) {
        await addJettonBalances({ api, jettonAddress, addresses, forceSleep: true })
      }

      // fetch the balances object and double the balances to account for the fact that we are only counting one side of each liquidity pool (the side that is a core asset, which is what we want to count towards TVL). This is a common approach for TVL calculations of AMM pools.
      return api.getBalancesV2().clone(2).getBalances()

    },
    staking: async () => {
      const mega_vault = "EQD9Z7L2oLpWvW-NZFB9njBGg2JqIE2rpJ_Fcocg9IEQ-EGF"
      const res = await get(`https://tonapi.io/v2/accounts/${mega_vault}/jettons?currencies=mega`);
      const vaultMegaWallet = res.balances.find((data) => data.jetton.address == megaAddress)
      return { ['ton:EQBf6-YoR9xylol_NwjHrLkrTFAZJCX-bsd-Xx_902OaPaBf']: vaultMegaWallet.balance }
    }
  }
}
