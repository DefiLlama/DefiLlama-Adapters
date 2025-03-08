const ADDRESSES = require("../helper/coreAssets.json");

const boringVaultsV0Base = [
  {
    name: "Coinbase BTC",
    vault: "0x42A03534DBe07077d705311854E3B6933dD6Af85",
    accountant: "0x1c217f17d57d3CCD1CB3d8CB16B21e8f0b544156",
    teller: "0x66B912f197D9810d7b74E43d55bBbFC60034E98a",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 19387993, 
    baseAsset: ADDRESSES.base.cbBTC,
  },
  {
    name: "Staked ETHFI",
    vault: "0x86B5780b606940Eb59A062aA85a07959518c0161",
    accountant: "0x05A1552c5e18F5A0BB9571b5F2D6a4765ebdA32b",
    teller: "0xe2acf9f80a2756E51D1e53F9f41583C84279Fb1f",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 19686016, 
    baseAsset: ADDRESSES.base.ETHFI,
  },
  {
    name: "Lombard BTC",
    vault: "0x5401b8620E5FB570064CA9114fd1e135fd77D57c",
    accountant: "0x28634D0c5edC67CF2450E74deA49B90a4FF93dCE",
    teller: "0x2eA43384F1A98765257bc6Cb26c7131dEbdEB9B3",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 22113564,
    baseAsset: ADDRESSES.base.WBTC,
  },
  {
    name: "EBTC",
    vault: "0x657e8C867D8B37dCC18fA4Caead9C45EB088C642",
    accountant: "0x1b293DC39F94157fA0D1D36d7e0090C8B8B8c13F",
    teller: "0xe19a43B1b8af6CeE71749Af2332627338B3242D1",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 22113992,
    baseAsset: ADDRESSES.base.WBTC,
  },
  {
    name: "Liquid ETH",
    vault: "0xf0bb20865277aBd641a307eCe5Ee04E79073416C",
    accountant: "0x0d05D94a5F1E76C18fbeB7A13d17C8a314088198",
    teller: "0x5c135e8eC99557b412b9B4492510dCfBD36066F5",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 17482303,
    baseAsset: ADDRESSES.base.WETH,
  }
];

module.exports = {
  boringVaultsV0Base,
};
