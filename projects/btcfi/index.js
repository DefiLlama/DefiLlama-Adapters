const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, } = require('../helper/unwrapLPs')

const chainPools = {
  bfc: {
    WBTC: { pool: '0xA84F9F42dF222da491571Fb70cCc11AC84B7F29D', token: ADDRESSES.bfc.WBTC },
    BTCB: { pool: '0xee66D8C40282439F2eE855D8a3666FB73257D349', token: ADDRESSES.bfc.BTCB }
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