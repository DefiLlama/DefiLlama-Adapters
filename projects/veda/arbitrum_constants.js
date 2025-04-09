const ADDRESSES = require("../helper/coreAssets.json");

const boringVaultsV0Arbitrum = [
  {
    name: "Staked ETHFI",
    vault: "0x86B5780b606940Eb59A062aA85a07959518c0161",
    accountant: "0x05A1552c5e18F5A0BB9571b5F2D6a4765ebdA32b",
    teller: "0xe2acf9f80a2756E51D1e53F9f41583C84279Fb1f",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 230459109, 
    baseAsset: ADDRESSES.arbitrum.ETHFI,
  },
  {
    name: "EBTC",
    vault: "0x657e8C867D8B37dCC18fA4Caead9C45EB088C642",
    accountant: "0x1b293DC39F94157fA0D1D36d7e0090C8B8B8c13F",
    teller: "0xe19a43B1b8af6CeE71749Af2332627338B3242D1",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 283262327, 
    baseAsset: ADDRESSES.arbitrum.WBTC,
  },
];

module.exports = {
  boringVaultsV0Arbitrum,
};
