const ADDRESSES = require("../helper/coreAssets.json");

const boringVaultsV0Fuse = [
  {
    name: "Solid USD",
    vault: "0x75333830E7014e909535389a6E5b0C02aA62ca27",
    accountant: "0x47A5e832E1178726dd13AdD762774A704878AD98",
    teller: "0x220d4667AA06E0Aa39f62c601690848f2e48BC15",
    lens: "0x8478Cc70B7e389212D301Fef4f9aDfd4F869f28D",
    startBlock: 36144442, 
    baseAsset: ADDRESSES.fuse.USDC_3, 
  },
  {
    name: "Solid Fuse",
    vault: "0xb33c8F0b0816fd147FCF896C594a3ef408845e2C",
    accountant: "0xb29B5F760d38587f7F4C896C458B9EEB5CAd9C0C",
    teller: "0x4Aa13c96d45FDF14731acEF8F6a2DBf17D6BD53c",
    lens: "0x8478Cc70B7e389212D301Fef4f9aDfd4F869f28D",
    startBlock: 40381360, 
    baseAsset: ADDRESSES.fuse.WFUSE, 
  }
];

module.exports = {
  boringVaultsV0Fuse
};
