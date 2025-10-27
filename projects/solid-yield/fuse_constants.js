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
  }
];

module.exports = {
  boringVaultsV0Fuse
};
