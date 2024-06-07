const { getLogs } = require('../helper/cache/getLogs')
const sdk = require('@defillama/sdk')

const config = {
  ethereum: {
    vaults: [
      '0xf3bF8720De4741133FC59fb69650A42f4DEdFd58',
      '0xAeA3824ED5Fe391c05CD96D1042645EE13Cbf745',
      '0xa77a8D25cEB4B9F38A711850751edAc70d7b91b0',
      '0xbf0311df31af8b027a12051c00d02aa85a322594'
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
      const baseTvl = await api.multiCall({ abi: 'function baseTvl() public view returns (address[], uint256[])', calls: vaults })
      baseTvl.forEach((tvl, i) => {

        const tokens = tvl[0]
        const amounts = tvl[1]
        tokens.forEach((v, j) => sdk.util.sumSingleBalance(balances, v, amounts[j], api.chain))
      })
      return balances
    }
  }
})