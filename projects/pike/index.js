const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs')

const config = {
  ethereum: { tokensAndOwners: [
    [ADDRESSES.null, '0xFC7599cfFea9De127a9f9C748CCb451a34d2F063'],
    [ADDRESSES.ethereum.USDC, '0x54FD7bA87DDBDb4b8a28AeE34aB8ffC4004687De']
  ]},
  optimism: { tokensAndOwners: [
    [ADDRESSES.optimism.OP, '0x1E65e48532f6Cf9747774777F3f1F6dC6cf0D81b'],
    [ADDRESSES.optimism.USDC_CIRCLE, '0x7856493B59cdb1685757A6DcCe12425F6a6666a0']
  ]},
  arbitrum: { tokensAndOwners: [
    [ADDRESSES.arbitrum.ARB, '0x1E65e48532f6Cf9747774777F3f1F6dC6cf0D81b'],
    [ADDRESSES.arbitrum.USDC_CIRCLE, '0x7856493B59cdb1685757A6DcCe12425F6a6666a0']
  ]},
  base: { tokensAndOwners: [
    // [ADDRESSES.base.WETH, '0xFC7599cfFea9De127a9f9C748CCb451a34d2F063'],
    [ADDRESSES.base.USDC, '0xA9452cA8281556DAfA4C0d3DA3dcaAa184941032']
  ]}
}

module.exports.hallmarks=[[1714435200, "Protocol exploit"]]

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport(config[chain])
  }
})