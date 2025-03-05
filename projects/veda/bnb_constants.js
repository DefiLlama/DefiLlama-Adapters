const ADDRESSES = require("../helper/coreAssets.json");

const boringVaultsV0Bnb = [
  {
    name: "Lombard BTC",
    vault: "0x5401b8620E5FB570064CA9114fd1e135fd77D57c",
    accountant: "0x28634D0c5edC67CF2450E74deA49B90a4FF93dCE",
    teller: "0x2eA43384F1A98765257bc6Cb26c7131dEbdEB9B3",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 42143259, 
    baseAsset: ADDRESSES.bsc.WBTC, 
  }
];

module.exports = {
  boringVaultsV0Bnb
};
