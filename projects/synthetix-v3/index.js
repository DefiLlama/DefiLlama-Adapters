const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const CUSTOM_ADDRESSES = {
  arbitrum: {
    WEETH: "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe",
    sUSDe: ADDRESSES.arbitrum.sUSDe,
    tBTC: "0x6c84a8f1c29108F47a79964b5Fe888D4f4D0dE40"
  }
}

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner: '0xffffffaEff0B96Ea8e4f94b2253f31abdD875847', tokens: [ADDRESSES.ethereum.SNX] })
  },
  base: {
    tvl: sumTokensExport({ owner: '0x32C222A9A159782aFD7529c87FA34b96CA72C696', tokens: [ADDRESSES.base.USDC] })
  },
  arbitrum: {
    tvl: sumTokensExport({ owner: '0xffffffaEff0B96Ea8e4f94b2253f31abdD875847', tokens: [ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.arbitrum.WETH, ADDRESSES.arbitrum.ARB, ADDRESSES.arbitrum.USDe, ADDRESSES.arbitrum.WSTETH, CUSTOM_ADDRESSES.arbitrum.WEETH, CUSTOM_ADDRESSES.arbitrum.sUSDe, CUSTOM_ADDRESSES.arbitrum.tBTC] })
  }
}
