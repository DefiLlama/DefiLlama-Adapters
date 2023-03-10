const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");

const treasury = {
  arbitrum: {
    X7TreasurySplitterAddress: "0x70006b785aa87821331a974c3d5af81cde5bb999",
    DeveloperMultiSigWalletAddress:
      "0x5cf4288bf373bbe17f76948e39baf33b9f6ac2e0",
    CommmunityMultiSigWalletAddress:
      "0x7063E83dF5349833A21f744398fD39D42fbC00f8",
    LendingPoolReserveAddress: "0x7Ca54e9Aa3128bF15f764fa0f0f93e72b5267000",
    RewardsPoolAddress: "0x70000299ee8910ccacd97b1bb560e34f49c9e4f7",
  },
  bsc: {
    X7TreasurySplitterAddress: "0x70006b785aa87821331a974c3d5af81cde5bb999",
    DeveloperMultiSigWalletAddress:
      "0x5cf4288bf373bbe17f76948e39baf33b9f6ac2e0",
    CommmunityMultiSigWalletAddress:
      "0x7063E83dF5349833A21f744398fD39D42fbC00f8",
    LendingPoolReserveAddress: "0x7Ca54e9Aa3128bF15f764fa0f0f93e72b5267000",
    RewardsPoolAddress: "0x70000299ee8910ccacd97b1bb560e34f49c9e4f7",
  },
  ethereum: {
    X7TreasurySplitterAddress: "0x70006b785aa87821331a974c3d5af81cde5bb999",
    DeveloperMultiSigWalletAddress:
      "0x5cf4288bf373bbe17f76948e39baf33b9f6ac2e0",
    CommmunityMultiSigWalletAddress:
      "0x7063E83dF5349833A21f744398fD39D42fbC00f8",
    LendingPoolReserveAddress: "0x7Ca54e9Aa3128bF15f764fa0f0f93e72b5267000",
    RewardsPoolAddress: "0x70000299ee8910ccacd97b1bb560e34f49c9e4f7",
  },
  optimism: {
    X7TreasurySplitterAddress: "0x70006b785aa87821331a974c3d5af81cde5bb999",
    DeveloperMultiSigWalletAddress:
      "0x5cf4288bf373bbe17f76948e39baf33b9f6ac2e0",
    CommmunityMultiSigWalletAddress:
      "0x7063E83dF5349833A21f744398fD39D42fbC00f8",
    LendingPoolReserveAddress: "0x7Ca54e9Aa3128bF15f764fa0f0f93e72b5267000",
    RewardsPoolAddress: "0x70000299ee8910ccacd97b1bb560e34f49c9e4f7",
  },
  polygon: {
    X7TreasurySplitterAddress: "0x70006b785aa87821331a974c3d5af81cde5bb999",
    DeveloperMultiSigWalletAddress:
      "0x5cf4288bf373bbe17f76948e39baf33b9f6ac2e0",
    CommmunityMultiSigWalletAddress:
      "0x7063E83dF5349833A21f744398fD39D42fbC00f8",
    LendingPoolReserveAddress: "0x7Ca54e9Aa3128bF15f764fa0f0f93e72b5267000",
    RewardsPoolAddress: "0x70000299ee8910ccacd97b1bb560e34f49c9e4f7",
  },
};

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      owners: Object.values(treasury.arbitrum),
      tokens: [nullAddress],
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owners: Object.values(treasury.bsc),
      tokens: [nullAddress],
    }),
  },
  ethereum: {
    tvl: sumTokensExport({
      owners: Object.values(treasury.ethereum),
      tokens: [nullAddress],
    }),
  },
  polygon: {
    tvl: sumTokensExport({
      owners: Object.values(treasury.polygon),
      tokens: [nullAddress],
    }),
  },
  optimism: {
    tvl: sumTokensExport({
      owners: Object.values(treasury.optimism),
      tokens: [nullAddress],
    }),
  },
};
