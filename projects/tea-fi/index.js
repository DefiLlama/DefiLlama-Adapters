const { stakings } = require("../helper/staking");
const coreAssets = require("../helper/coreAssets.json");

const SYNTHETIC_TOKENS_ETH = [
  coreAssets.ethereum.tUSDT,
  coreAssets.ethereum.tPOL,
  coreAssets.ethereum.tUSDC,
  coreAssets.ethereum.tSOL,
  coreAssets.ethereum.tWBTC,
  coreAssets.ethereum.tWETH
]
const SYNTHETIC_TOKENS_POL = [
  coreAssets.polygon.tUSDT,
  coreAssets.polygon.tWPOL,
  coreAssets.polygon.tUSDC,
  coreAssets.polygon.tSOL,
  coreAssets.polygon.tWBTC,
  coreAssets.polygon.tWETH
]

const SYNTHETIC_STAKING_ETH = '0xd491C1A7E3C6AF6c2A8f8e3EF54E50044F3BA9AA';
const SYNTHETIC_STAKING_POL = '0xBeB9503dDBDA15aE0D19cf817028C19077f0e99E';

module.exports = {
  methodology: "TVL represents the overall liquidity held across all synthetic asset staking pools on a given chain.",
  ethereum: {
    tvl: () => ({}),
    staking: stakings([SYNTHETIC_STAKING_ETH], SYNTHETIC_TOKENS_ETH, "ethereum"),
  },
  polygon: {
    tvl: () => ({}),
    staking: stakings([SYNTHETIC_STAKING_POL], SYNTHETIC_TOKENS_POL, "polygon"),
  }
};