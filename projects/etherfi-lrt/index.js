const { sumTokensExport } = require('../helper/unwrapLPs');
const vaults = [
  '0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88',
  '0x7223442cad8e9cA474fC40109ab981608F8c4273',
  '0x657e8C867D8B37dCC18fA4Caead9C45EB088C642',
]

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: sumTokensExport({ owners: vaults, fetchCoValentTokens: true, tokenConfig: {
      onlyWhitelisted: false,
    }}),
  },
}