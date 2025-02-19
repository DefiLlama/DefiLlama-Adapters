const { sumERC4626VaultsExport } = require('../helper/erc4626')

const config = {
  arbitrum: {
    vaults: {
      USDCv1: '0x6b416C9727fb248C3097b5c1D10c39a7EBDFf239',
      USDTv1: '0x8b002cf7380403329627149aA3D730E633BF1D33',
      DAIv1: '0xdC4c8Bfbf326d5F87fCB58D1a6E5B6E23992E61d',
      WETHv1: '0xE8FEB169cc9ffbF3873EbfD31e34144672D9D7D0',
      WBTCv1: '0xd5687bfa0b5EBc020dc726282cFD94086701DF94',
      USDC: '0x2ca95BF88068c7570D020B726CABd3952f647133',
      USDT: '0xc8d237311E9D7178b9DcadCE2F154053536B25C1',
      DAI: '0xFa475C8ff8909200b9cBC739Ff92A8cA8Dd34275',
      FRAX: '0xe64A672e608bbc08F0F471C271f7753C705F0AAF',
      WETH: '0x695f4c97D3fa483654340eFFE257bfe9855efE34',
      WBTC: '0x597f2B7604e2B1CF001f2BCD882F75d53B1ea586',
    }
  },
}
module.exports = {
  methodology: 'We calculate the TVL as the sum of (deposits + loans + locked profits - losses) for each vault available',
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
