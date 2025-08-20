const ADDRESSES = require("../helper/coreAssets.json");

const boringVaultsV0Hyperevm = [
  {
    name: "KHYPE",
    vault: "0x9BA2EDc44E0A4632EB4723E81d4142353e1bB160",
    accountant: "0x74392Fa56405081d5C7D93882856c245387Cece2",
    teller: "0x29C0C36eD3788F1549b6a1fd78F40c51F0f73158",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 8440831,
    baseAsset: ADDRESSES.hyperliquid.WHYPE,
  },
];

module.exports = {
  boringVaultsV0Hyperevm,
};
