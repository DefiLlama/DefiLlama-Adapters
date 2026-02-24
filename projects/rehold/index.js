const { sumTokensExport } = require('../helper/unwrapLPs')
const vault = '0xd476ce848c61650e3051f7571f3ae437fe9a32e0'

const tvl = sumTokensExport({ owner: vault, fetchCoValentTokens: true, })

module.exports = {
  bsc: { tvl },
  polygon: { tvl },
  avax: { tvl },
  arbitrum: { tvl },
  optimism: { tvl },
  fantom: { tvl },

  hallmarks: [
    ['2023-07-07', "ReHold V2 Launch"],
    ['2023-07-19', "Ethereum Deployment"],
    ['2023-08-01', "Limit Orders Launch"],
    ['2023-10-30', "ReHold Swaps Launch"],
  ],
}
