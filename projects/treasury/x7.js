const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const ethTreasury = {
  'X7TreasurySplitterAddress': '0x70006b785aa87821331a974c3d5af81cde5bb999',
  'DeveloperMultiSigWalletAddress': '0x5cf4288bf373bbe17f76948e39baf33b9f6ac2e0',
  'CommmunityMultiSigWalletAddress': '0x7063E83dF5349833A21f744398fD39D42fbC00f8',
  'MarketingWalletAddress': '0x5Bacb575b88888D08231b65B243419eDe49D1795',
  'DeveloperWalletAddress': '0x76685a61585010B7855436906E50c05f91d316F9',
};

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owners: Object.values(ethTreasury), tokens: [nullAddress] }),
  },
};
