const { sumTokensExport, } = require('../helper/unwrapLPs')

//https://nocturne-xyz.gitbook.io/nocturne/developers/contract-addresses
const config = {
  ethereum: {
    contracts: {
      Teller: '0xA561492dFC1A90418Cc8b9577204d56C17CB32Ff',
      Handler: '0x33ab3ceC16B6640945E669a86C897A8e03f019CD',
      DepositManager: '0x1B33B8499EB6D681CDcF19c79dF8A3Dec9c652C3',
    }
  }
}

Object.keys(config).forEach(chain => {
  const { contracts } = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ owners: Object.values(contracts), fetchCoValentTokens: true, })
  }
})

module.exports.hallmarks = [
  ['2024-01-22', 'Nocturne V1 is being sunset'],
]