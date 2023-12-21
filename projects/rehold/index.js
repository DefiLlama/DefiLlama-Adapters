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
    [1688688480, "ReHold V2 Launch"],
    [1689743327, "Ethereum Deployment"],
    [1690898169, "Limit Orders Launch"],
    [1698624000, "ReHold Swaps Launch"],
  ],
}
