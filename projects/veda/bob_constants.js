const ADDRESSES = require("../helper/coreAssets.json");

const boringVaultsV0Bob = [
  {
    name: "Hybrid BTC",
    vault: "0x9998e05030Aee3Af9AD3df35A34F5C51e1628779",
    accountant: "0x22b025037ff1F6206F41b7b28968726bDBB5E7D5",
    teller: "0x19ab8c9896728d3A2AE8677711bc852C706616d3",
    lens: "0xb1DB783AfdBb0076486692152608f2E762bB75AE",
    startBlock: 13262672,
    baseAsset: ADDRESSES.bob.WBTC,
  }
];

module.exports = {
  boringVaultsV0Bob,
};