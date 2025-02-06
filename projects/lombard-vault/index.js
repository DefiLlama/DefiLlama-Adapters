const { sumTokensExport } = require('../helper/unwrapLPs');
const vaults = [
  '0x5401b8620E5FB570064CA9114fd1e135fd77D57c', // Lombard DeFi Vault https://www.lombard.finance/app/vault/
]

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: sumTokensExport({ owners: vaults, fetchCoValentTokens: true, tokenConfig: {
      onlyWhitelisted: false,
    }, resolveUniV3: true,}),
  },
  base: {
    tvl: sumTokensExport({ owners: vaults, fetchCoValentTokens: true, tokenConfig: {
      onlyWhitelisted: false,
    }, resolveUniV3: true,}),
  },
  bsc: {
    tvl: sumTokensExport({ owners: vaults, fetchCoValentTokens: true, tokenConfig: {
      onlyWhitelisted: false,
    }, resolveUniV3: true,}),
  },
}