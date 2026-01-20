const sdk = require("@defillama/sdk");
const { cachedGraphQuery } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { uniTvlExport } = require('../helper/unknownTokens')

const RUBICON_MARKET_OPTIMISM = '0x7a512d3609211e719737E82c7bb7271eC05Da70d'
const RUBICON_MARKET_ARBITRUM = '0xC715a30FDe987637A082Cf5F19C74648b67f2db8'

const baseFactory = '0xA5cA8Ba2e3017E9aF3Bd9EDa69e9E8C263Abf6cD'

const base = 'base'


module.exports = {
  methodology: "Counts the tokens on the market (orders in the orderbook) and in bath pools",
  hallmarks: [
    [1657915200, "OP Rewards Start"],
    [1685073974, "V2 Upgrade"],
    [1688184374, "OP Rewards for Makers"],
    [1688616374, "Arbitrum Launch"]
  ]
}

module.exports = uniTvlExport(base, baseFactory)

const config = {
  optimism: {
    endpoint: sdk.graph.modifyEndpoint('AUcAkUd4sJutFD3hYQfvB6uvXrEdYP26qiZwZ5qyrgTw'),
    owners: [
      RUBICON_MARKET_OPTIMISM, // Rubicon Market
      "0xB0bE5d911E3BD4Ee2A8706cF1fAc8d767A550497", // bathETH
      "0x7571CC9895D8E997853B1e0A1521eBd8481aa186", // bathWBTC 
      "0xe0e112e8f33d3f437D1F895cbb1A456836125952", // bathUSDC
      "0x60daEC2Fc9d2e0de0577A5C708BcaDBA1458A833", // bathDAI
      "0xfFBD695bf246c514110f5DAe3Fa88B8c2f42c411", // bathUSDT
      "0xeb5F29AfaaA3f44eca8559c3e8173003060e919f", // bathSNX
      "0x574a21fE5ea9666DbCA804C9d69d8Caf21d5322b"  // bathOP
    ]
  },
  arbitrum: {
    endpoint: sdk.graph.modifyEndpoint('B4cTJXyWHMLkxAcpLGK7dJfArJdrbyWukCoCLPDT1f7n'),
    owners: [RUBICON_MARKET_ARBITRUM,]
  }
}

Object.keys(config).forEach(chain => {
  const { endpoint, owners } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const response = await cachedGraphQuery('rubicon/' + chain, endpoint, `{ tokens { address } }`)
      const tokens = response.tokens.map(i => i.address)
      return sumTokens2({ api, tokens, owners})
    }
  }
})