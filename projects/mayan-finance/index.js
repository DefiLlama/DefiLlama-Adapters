const { sumTokens2 } = require("../helper/unwrapLPs");
const { ADDRESSES } = require("../helper/utils");

const SWIFT = "0xC38e4e6A15593f908255214653d3D947CA1c2338";

const TOKENS = {
  ethereum: [
    ADDRESSES.ethereum.USDC,
    ADDRESSES.ethereum.WETH,
  ],
  arbitrum: [
    ADDRESSES.arbitrum.USDC,
    "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", // USDC.e
    ADDRESSES.arbitrum.WETH,
  ],
  base: [
    ADDRESSES.base.USDC,
    ADDRESSES.base.WETH,
  ],
  avax: [
    "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", // USDC
    "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB", // WETH.e
  ],
  bsc: [
    "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC
    "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", // ETH
  ],
  polygon: [
    "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC.e
    "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC
  ],
  optimism: [
    "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // USDC
    ADDRESSES.optimism.WETH,
  ],
  monad: [
    "0x62534E4bBD6D9ebAC0ac99aeaa0aa48E56372df0", // USDC
  ],
  hyperliquid: [
    "0x6d1e7cde53ba9467b783cb7c530ce054",  // USDC on HyperEVM
  ],
  unichain: [
    "0x078D782b760474a361dDA0AF3839290b0EF57AD6", // USDC
  ],
};

async function tvl(api) {
  const tokens = TOKENS[api.chain];
  if (!tokens) return {};
  return sumTokens2({ api, owners: [SWIFT], tokens });
}

module.exports = {
  methodology: "Tracks tokens locked in Mayan Finance Swift escrow contract (0xC38e4e6A...) across all supported EVM chains while cross-chain swaps are in-flight.",
};

Object.keys(TOKENS).forEach(chain => {
  module.exports[chain] = { tvl };
});
