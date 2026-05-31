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
  },
  {
    name: "Solid ETH",
    vault: "0xEf1c1fFbEabDF358E61D3F5F14777e9c1bC8D1c7",
    accountant: "0x4BD5873720072b4AC7956898dbCBc543b2fD3749",
    teller: "0xEaacf4534cCC05CAd929830fAF611d872b291d41",
    lens: "0x8478Cc70B7e389212D301Fef4f9aDfd4F869f28D",
    startBlock: 41311096,
    baseAsset: ADDRESSES.fuse.WETH_3,
  },
];

module.exports = {
  boringVaultsV0Fuse
};
