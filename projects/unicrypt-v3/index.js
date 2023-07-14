const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getCoreAssets } = require('../helper/tokenMapping')

const config = {
  ethereum: { reserves: ['0x231278edd38b00b07fbd52120cef685b9baebcc1'] },
  arbitrum: { reserves: ['0xfa104eb3925a27e6263e05acc88f2e983a890637'] },
  bsc: { reserves: ['0x0D29598EC01fa03665feEAD91d4Fb423F393886c'] },
}

module.exports = {
  misrepresentedTokens: true,
}

Object.keys(config).forEach(chain => {
  const { reserves } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const uniV3WhitelistedTokens = await getCoreAssets(api.chain)
      const tempBalances = await sumTokens2({ api, owners: reserves, resolveUniV3: true, uniV3WhitelistedTokens, })
      const balances = {} // we multiple core assets value by 2 as positions are spread between 0 -  ∞ 
      Object.entries(tempBalances).forEach(([token, balance]) => sdk.util.sumSingleBalance(balances, token, balance * 2))
      return balances
    }
  }
})