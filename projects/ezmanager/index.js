const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  methodology: 'TVL is the sum of token amounts for all currently active positions registered in EZManager CLCore on Base.',
  doublecounted: true,
  base: { tvl: sumTokensExport({
    owner: '0x61c36AFF32Be348a3D1FE1E2B4745048f652770F',  // CLCore
    resolveUniV3: true,
    resolveSlipstream: true,
  }) },
}
