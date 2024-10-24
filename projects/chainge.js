const ADDRESSES = require('./helper/coreAssets.json')
const { sumTokensExport } = require('./helper/unwrapLPs')

const config = {
  rollux: {
    chaingeAddress: "0x66ff2f0AC3214758D1e61B16b41e3d5e62CAEcF1",
    tokens: [
      ADDRESSES.rollux.USDC,
      ADDRESSES.rollux.USDT,
      ADDRESSES.rollux.WBTC,
      ADDRESSES.rollux.WETH,
      ADDRESSES.rollux.WSYS,
      ADDRESSES.null, // for native SYS
    ]
  }
}

module.exports = {
    methodology: "assets in liquidity are counted as TVL + balances of all tokens (USDC, USDT, WBTC, WETH, WSYS, and native SYS) held in the Chainge treasury address on the Rollux network. These tokens are used to provide liquidity for cross-chain swaps.",
}

Object.keys(config).forEach(chain => {
  const { chaingeAddress, tokens } = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ owner: chaingeAddress, tokens })
  }
})