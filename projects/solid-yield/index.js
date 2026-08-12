const ADDRESSES = require("../helper/coreAssets.json");
const { chainTvl } = require("../helper/boringVault");

const boringVaultsEthereum = [
  {
    name: "Solid USD",
    vault: "0x6E575AE5e1A12e910641183F555Fad62eD1481F2",
    accountant: "0x10f3996904F1fA09Db48e5d46AAdD6D9fd516eFe",
    teller: "0x43F2face25Bb22d296B9Ab643Dac7755D89632E5",
    lens: "0x074F543E7DaA7C67F77bfD8C41C79127c4dd80d9",
    startBlock: 22651939,
    baseAsset: ADDRESSES.ethereum.USDC,
  },
  {
    name: "Solid ETH",
    vault: "0xf9039d4f49686F34936b6937D13bBbe413f910c4",
    accountant: "0x803ed5a218a7704fC8697d36079F70df974Abb11",
    teller: "0x4149c11b479B26080428Dc5e688F4D27253C4783",
    lens: "0x074F543E7DaA7C67F77bfD8C41C79127c4dd80d9",
    startBlock: 24822485,
    baseAsset: ADDRESSES.ethereum.WETH,
  },
];

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
  timetravel: true,
  misrepresentedTokens: false,
  start: 1749279179,
  doublecounted: true,
  ["ethereum"]: { tvl: (api) => chainTvl(api, boringVaultsEthereum) },
  ["fuse"]: { tvl: (api) => chainTvl(api, boringVaultsV0Fuse) },
};
