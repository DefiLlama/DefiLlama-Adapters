const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, } = require('../helper/unwrapLPs')

const chainPools = {
  bfc: {
    WBTC: { pool: '0xEa3b4a2dA5DbE8379AD4c60aaD5184df69D7C9AD', token: ADDRESSES.bfc.WBTC },
    BTCB: { pool: '0x0B31FeE8bF53bFe2f5F7083B73A4c9C8B517E32F', token: ADDRESSES.bfc.BTCB }
  },
}

Object.keys(chainPools).forEach(chain => {
  const pools = chainPools[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      return sumTokens2({ api, tokensAndOwners: Object.values(pools).map(({ pool, token }) => ([token, pool,])) })
    }
  }
})