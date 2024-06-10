const { getLogs } = require('../helper/cache/getLogs')
const sdk = require('@defillama/sdk')

const config = {
  ethereum: {
    vaults: [
      '0xBEEF69Ac7870777598A04B2bd4771c71212E6aBc',
      '0x84631c0d0081FDe56DeB72F6DE77abBbF6A9f93a',
      '0x5fD13359Ba15A84B76f7F87568309040176167cd',
      '0x7a4EffD87C2f3C55CA251080b1343b605f327E3a'
    ],
    fromBlock: 20039678,
  },
}

module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach(chain => {
  const { vaults, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const balances = {}
      const baseTvl = await api.multiCall({ abi: 'function underlyingTvl() public view returns (address[], uint256[])', calls: vaults })
      baseTvl.forEach((tvl, i) => {

        const tokens = tvl[0]
        const amounts = tvl[1]
        tokens.forEach((v, j) => sdk.util.sumSingleBalance(balances, v, amounts[j], api.chain))
      })
      return balances
    }
  }
})