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
  bsc: {
    owner: '0x10c6d38F0c19c09b7cEFDE5F42494e4FECA08EB2',
    resolveUniV3: true,
  },
  hyperliquid: {
    owner: '0x6F81790Ebac25497be379Dc66143fb298663Ae11',
    resolveUniV3: true,
    uniV3ExtraConfig: {
      nftAddress: '0xead19ae861c29bbb2101e834922b2feee69b9091',
    },
  },
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: sumTokensExport(config[chain]),
  }
})

module.exports.methodology = 'TVL is the sum of token amounts for all currently active positions registered in EZManager CLCore across Base, Arbitrum, Ethereum, BSC, and Hyperliquid.'
module.exports.doublecounted = true
