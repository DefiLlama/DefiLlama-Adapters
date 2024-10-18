const { sumTokensExport } = require('../helper/unwrapLPs')

const vaultAddress = '0xb5F3a9dD92270f55e55B7Ac7247639953538A261'

const vaults = {
  ethereum: {},
  linea: {},
  polygon: {},
}

module.exports = {
  methodology: 'The total amount of assets locked in the Yellow Wallet.',
}

Object.keys(vaults).forEach((chain) => {
  const { vault = vaultAddress, tokens = [] } = vaults[chain]

  module.exports[chain] = {
    tvl: sumTokensExport({ owner: vault, tokens, fetchCoValentTokens: true }),
  }
})
