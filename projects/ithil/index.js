const { sumERC4626VaultsExport } = require('../helper/erc4626')

const config = {
  arbitrum: {
    vaults: {
      USDC: '0x6b416C9727fb248C3097b5c1D10c39a7EBDFf239',
      USDT: '0x8b002cf7380403329627149aA3D730E633BF1D33',
      DAI: '0xdC4c8Bfbf326d5F87fCB58D1a6E5B6E23992E61d',
      WETH: '0xE8FEB169cc9ffbF3873EbfD31e34144672D9D7D0',
      WBTC: '0xd5687bfa0b5EBc020dc726282cFD94086701DF94',
    }
  },
}
module.exports = {
  methodology: 'We calculate the TVL as the sum of (deposits + loans + locked profits - losses) for each vault available',
  start: 119401838,
  hallmarks: [
    [1691649008, "private mainnet launch"]
  ],
}

Object.keys(config).forEach(chain => {
  const { vaults } = config[chain]
  module.exports[chain] = {
    tvl: sumERC4626VaultsExport({ vaults: Object.values(vaults), tokenAbi: 'asset', balanceAbi: 'totalAssets' })
  }
})