const ADDRESSES = require("../helper/coreAssets.json");

const boringVaultsV0Sonic = [
  {
    name: "Sonic scETH",
    vault: ADDRESSES.sonic.scETH,
    accountant: "0x3a592F9Ea2463379c4154d03461A73c484993668",
    teller: "0x31A5A9F60Dc3d62fa5168352CaF0Ee05aA18f5B8",
    lens: "0xE0eFE934DC4744090e8eF93f1D125E4015a857FE",
    startBlock: 591869, 
    baseAsset: ADDRESSES.sonic.WETH,
  },
  {
    name: "Sonic scUSD",
    vault: ADDRESSES.sonic.scUSD,
    accountant: "0xA76E0F54918E39A63904b51F688513043242a0BE",
    teller: "0x358CFACf00d0B4634849821BB3d1965b472c776a",
    lens: "0xE0eFE934DC4744090e8eF93f1D125E4015a857FE",
    startBlock: 588029,
    baseAsset: ADDRESSES.sonic.USDC_e,
  },
  {
    name: "Sonic scBTC",
    vault: "0xBb30e76d9Bb2CC9631F7fC5Eb8e87B5Aff32bFbd",
    accountant: "0xC1a2C650D2DcC8EAb3D8942477De71be52318Acb",
    teller: "0xAce7DEFe3b94554f0704d8d00F69F273A0cFf079",
    lens: "0xE0eFE934DC4744090e8eF93f1D125E4015a857FE",
    startBlock: 6833997,
    baseAsset: ADDRESSES.sonic.LBTC,
  },
  {
    name: "Sonic LBTC Vault",
    vault: "0x309f25d839A2fe225E80210e110C99150Db98AAF",
    accountant: "0x0639e239E417Ab9D1f0f926Fd738a012153930A7",
    teller: "0x258f532CB41393c505554228e66eaf580B0171b2",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 6794046,
    baseAsset: ADDRESSES.sonic.LBTC,
  }
];

module.exports = {
  boringVaultsV0Sonic,
};