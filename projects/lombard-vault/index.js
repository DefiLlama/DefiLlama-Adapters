const { sumTokensExport } = require('../helper/unwrapLPs');
const vaults = [
  '0x5401b8620E5FB570064CA9114fd1e135fd77D57c',
]

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: sumTokensExport({ owners: vaults, fetchCoValentTokens: true, tokenConfig: {
      onlyWhitelisted: false,
    }, resolveUniV3: true,}),
  },
}