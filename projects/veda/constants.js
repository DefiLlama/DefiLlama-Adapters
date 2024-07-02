const ADDRESSES = require("../helper/coreAssets.json");

const legacyVaults = [
  {
    id: "0xeA1A6307D9b18F8d1cbf1c3Dd6aad8416C06a221",
    startBlock: 19460621,
    baseAsset: ADDRESSES.ethereum.WETH,
  },
];

const boringVaultsV0 = [
  {
    vault: "0x08c6F91e2B681FaF5e17227F2a44C307b3C1364C",
    accountant: "0xc315D6e14DDCDC7407784e2Caf815d131Bc1D3E7",
    teller: "0x221Ea02d409074546265CCD1123050F4D498ef64",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 19712987,
    baseAsset: ADDRESSES.ethereum.USDC,
  },
];

module.exports = {
  legacyVaults,
  boringVaultsV0,
};
