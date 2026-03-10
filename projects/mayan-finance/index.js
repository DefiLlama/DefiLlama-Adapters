const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");

const SWIFT = "0xC38e4e6A15593f908255214653d3D947CA1c2338";

const TOKENS = {
  ethereum: [ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.WETH],
  arbitrum: [ADDRESSES.arbitrum.USDC, ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.arbitrum.WETH],
  base: [ADDRESSES.base.USDC, ADDRESSES.base.WETH],
  avax: [ADDRESSES.avax.USDC, ADDRESSES.avax.WETH_e],
  bsc: [ADDRESSES.bsc.USDC, ADDRESSES.bsc.ETH],
  polygon: [ADDRESSES.polygon.USDC, ADDRESSES.polygon.USDC_CIRCLE],
  optimism: [ADDRESSES.optimism.USDC_CIRCLE, ADDRESSES.optimism.WETH_1],
  hyperliquid: [ADDRESSES.hyperliquid.USDT0, '0xb88339cb7199b77e23db6e890353e22632ba630f'],
  unichain: [ADDRESSES.unichain.USDC, ADDRESSES.unichain.WETH],
};


module.exports = {
  methodology: "Tracks tokens locked in Mayan Finance Swift escrow contract (0xC38e4e6A...) across all supported EVM chains while cross-chain swaps are in-flight.",
};

Object.keys(TOKENS).forEach(chain => {
  module.exports[chain] = { tvl: sumTokensExport({ owner: SWIFT, tokens: TOKENS[chain] }) };
});
