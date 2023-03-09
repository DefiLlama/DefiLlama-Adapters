const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const ethTreasury = {
  'X7TreasurySplitterAddress': '0x70006b785aa87821331a974c3d5af81cde5bb999',
  'DeveloperMultiSigWalletAddress': '0x5cf4288bf373bbe17f76948e39baf33b9f6ac2e0',
  'CommmunityMultiSigWalletAddress': '0x7063E83dF5349833A21f744398fD39D42fbC00f8',
  'RewardsWalletAddress': '0x70000299ee8910ccacd97b1bb560e34f49c9e4f7',
};

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owners: Object.values(ethTreasury), tokens: [nullAddress] }),
  },
};
