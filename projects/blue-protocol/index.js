const { sumTokens2 } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");

// ============ BSC ============
const bscStaking = "0xD245f811d2B8e94aA4EC23D430017d7EfE390439";
const bscTreasury = "0xC2d2D7eB9cbF2985714E3310bFDB8eEcC3E96992";

const bscTokens = {
  BLUE: "0xa90298e5B1203A2DD0006A75EABE158989C406Fb",
};

// Treasury tokens on BSC (non-LP assets)
const bscTreasuryTokens = [
  ADDRESSES.bsc.USDT,
  ADDRESSES.bsc.USDC,
  ADDRESSES.bsc.ETH,
  "0xC9Ad421f96579AcE066eC188a7Bba472fB83017F",
];

// LP tokens in treasury (for pool2)
const bscTreasuryLPs = [
  "0x149b55D78f6380Af73FFe57e9aDb7F1963BC251a",
  "0xeb7fE075B7677c98C75E105d4f5ACE0e19505567",
];

module.exports = {
  methodology: "Counts staked BLUE tokens and treasury holdings",
  bsc: {
    staking: async (api) => {
      return sumTokens2({
        api,
        owners: [bscStaking],
        tokens: [bscTokens.BLUE],
      });
    },
    tvl: async (api) => {
      if (bscTreasuryTokens.length === 0) return {};
      return sumTokens2({
        api,
        owners: [bscTreasury],
        tokens: bscTreasuryTokens,
        blacklistedTokens: [bscTokens.BLUE],
      });
    },
    pool2: async (api) => {
      return sumTokens2({
        api,
        owners: [bscTreasury],
        tokens: bscTreasuryLPs,
        resolveLP: true,
        blacklistedTokens: [bscTokens.BLUE],
      });
    },
  },
};