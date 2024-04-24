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
        "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497",
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
        '0x211Cc4DD073734dA055fbF44a2b4667d5E5fE5d2',
      ],
      owners: ["0x475c4af369b28997b25bd756ef92797ad3f69593"],
    }),
  },
};
