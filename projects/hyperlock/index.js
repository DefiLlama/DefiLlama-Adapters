const { sumTokensExport } = require('../helper/unwrapLPs')

// https://docs.hyperlock.finance/developers/hyperlock-contracts
module.exports = {
  doublecounted: true,
  blast: {
    tvl: sumTokensExport({ owners: ['0xc28EffdfEF75448243c1d9bA972b97e32dF60d06', '0xC3EcaDB7a5faB07c72af6BcFbD588b7818c4a40e'], resolveUniV3: true, })
  }
}