const { sumTokensExport } = require('../helper/unwrapLPs')

const config = {
  base: {
    owner: '0x61c36AFF32Be348a3D1FE1E2B4745048f652770F',
    resolveUniV3: true,
    resolveSlipstream: true,
  },
  arbitrum: {
    owner: '0xD52170Ae01B9198246842D9a4Ad964AcD786ae91',
    resolveUniV3: true,
  },
  ethereum: {
    owner: '0xaB264652495D3d0bDccfCCcC308C794eA0160312',
    resolveUniV3: true,
  },
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: sumTokensExport(config[chain]),
  }
})

module.exports.methodology = 'TVL is the sum of token amounts for all currently active positions registered in EZManager CLCore across Base, Arbitrum, and Ethereum.'
module.exports.doublecounted = true
