const ADDRESSES = require("../helper/coreAssets.json");

// Same address of the OriginalTokenBridge contract on all primary chains
const ORIGINAL_TOKEN_BRIDGE_ADDRESS =
  "0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898";

// Tokens on primary chains (e.g. Ethereum, Polygon and etc) tranferred to ShimmerEVM.
// These tokens are locked in the OriginalTokenBridge contract.
// Sum of all these token balances held by the OriginalTokenBridge is the TVL per token
const bridgedTokensPerPrimaryChain = [
  {
    // USDC
    ethereum: ADDRESSES.ethereum.USDC,
    bsc: ADDRESSES.bsc.USDC,
    arbitrum: ADDRESSES.arbitrum.USDC_CIRCLE,
    polygon: ADDRESSES.polygon.USDC_CIRCLE,
    base: ADDRESSES.base.USDC,
    avax: ADDRESSES.avax.USDC,
    optimism: ADDRESSES.optimism.USDC_CIRCLE,
    fantom: ADDRESSES.fantom.USDC_L0,
  },
  {
    // USDT
    ethereum: ADDRESSES.ethereum.USDT,
    bsc: ADDRESSES.bsc.USDT,
    arbitrum: ADDRESSES.arbitrum.USDT,
    polygon: ADDRESSES.polygon.USDT,
    optimism: ADDRESSES.optimism.USDT,
    avax: ADDRESSES.avax.USDt,
  },
  {
    // WBTC
    ethereum: ADDRESSES.ethereum.WBTC,
    arbitrum: ADDRESSES.arbitrum.WBTC,
    polygon: ADDRESSES.polygon.WBTC,
    optimism: ADDRESSES.optimism.WBTC,
  },
  {
    // WETH
    ethereum: ADDRESSES.ethereum.WETH,
    arbitrum: ADDRESSES.arbitrum.WETH,
    polygon: ADDRESSES.polygon.WETH_1,
    optimism: ADDRESSES.optimism.WETH_1,
    base: ADDRESSES.base.WETH,
  },
  {
    // AVAX
    avax: ADDRESSES.avax.WAVAX,
  },
  {
    // MATIC
    polygon: ADDRESSES.polygon.WMATIC_2,
  },
  {
    // BNB
    bsc: ADDRESSES.bsc.WBNB,
  },
  {
    // FTM
    fantom: ADDRESSES.fantom.WFTM,
  },
];

function chainTvl(chain) {
  return async (api) => {
    const toa = [];
    bridgedTokensPerPrimaryChain.forEach((token) => {
      if (!token[chain]) return;
      toa.push([token[chain], ORIGINAL_TOKEN_BRIDGE_ADDRESS]);
    });
    return api.sumTokens({ tokensAndOwners: toa });
  };
}

let chains = bridgedTokensPerPrimaryChain.reduce((allChains, token) => {
  Object.keys(token).forEach((key) => allChains.add(key));
  return allChains;
}, new Set());

module.exports.methodology = `Tokens bridged via shimmerbridge.org are counted as TVL`;
module.exports.misrepresentedTokens = true;
module.exports.hallmarks = [
  ["2023-12-27", "First Launch"],
];


Array.from(chains).forEach(chain => {
  module.exports[chain] =  { tvl: chainTvl(chain)}
})