const ADDRESSES = require("../helper/coreAssets.json");

const boringVaultsV0Berachain = [
  {
    name: "Liquid Bera ETH",
    vault: "0x83599937c2C9bEA0E0E8ac096c6f32e86486b410",
    accountant: "0x04B8136820598A4e50bEe21b8b6a23fE25Df9Bd8",
    teller: "0xCbc0D2838256919e55eB302Ce8c46d7eE0E9d807",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 198740,
    baseAsset: ADDRESSES.berachain.WETH,
  },
];

module.exports = {
  boringVaultsV0Berachain,
};
