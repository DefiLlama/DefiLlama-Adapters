const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json')

const DRP = '0x2FDdb4EeB8C2fb8A2213b5E888C98FC8209f89e0'

module.exports = {
  methodology: 'Counts WETH, wstETH, and rETH deposited as collateral in DRP.',

  ethereum: {
    tvl: sumTokensExport({ owner: DRP, tokens: [ADDRESSES.ethereum.WETH, ADDRESSES.ethereum.WSTETH, ADDRESSES.ethereum.RETH] }),
  },
  base: {
    tvl: sumTokensExport({ owner: DRP, tokens: [ADDRESSES.base.WETH, ADDRESSES.base.wstETH, ADDRESSES.base.rETH] }),
  },
  optimism: {
    tvl: sumTokensExport({ owner: DRP, tokens: [ADDRESSES.optimism.WETH_1, ADDRESSES.optimism.WSTETH, '0x9bcef72be871e61ed4fbbc7630889bee758eb81d'] }),
  },
  arbitrum: {
    tvl: sumTokensExport({ owner: DRP, tokens: [ADDRESSES.arbitrum.WETH, ADDRESSES.arbitrum.WSTETH, '0xec70dcb4a1efa46b8f2d97c310c9c4790ba5ffa8'] }),
  },
  scroll: {
    tvl: sumTokensExport({ owner: DRP, tokens: [ADDRESSES.scroll.WETH, '0xf610A9dfB7C89644979b4A0f27063E9e7d7Cda32'] }),
  },
  megaeth: {
    tvl: sumTokensExport({ owner: DRP, tokens: [ADDRESSES.megaeth.ETH, ADDRESSES.megaeth.wstETH] }),
  },
}
