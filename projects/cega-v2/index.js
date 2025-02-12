const ADDRESSES = require("../helper/coreAssets.json");
const { nullAddress, sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.WSTETH,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.WBTC,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.USDe,
        ADDRESSES.ethereum.sUSDe,
      ],
      owners: ["0xA8AB795731fbBFDd1Fbc57ca11e6f722e7783642"],
    }),
  },
  arbitrum: {
    tvl: sumTokensExport({
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.WSTETH,
        ADDRESSES.arbitrum.USDC_CIRCLE,
        ADDRESSES.arbitrum.USDT,
        ADDRESSES.arbitrum.WBTC,
        ADDRESSES.arbitrum.DAI,
        ADDRESSES.arbitrum.USDe,
        ADDRESSES.arbitrum.sUSDe,
      ],
      owners: ["0x475c4af369b28997b25bd756ef92797ad3f69593"],
    }),
  },
};
