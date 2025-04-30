const ADDRESSES = require("../helper/coreAssets.json");

const boringVaultsV0Berachain = [
  {
    name: "Prime Liquid Bera BTC",
    vault: "0x46fcd35431f5B371224ACC2e2E91732867B1A77e",
    accountant: "0x4faE50B524e0D05BD73fDF28b273DB7D4A57CCe9",
    teller: "0xf16Cd75E975163f3A0A1af42E5609aB67A6553D7",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 200107,
    baseAsset: ADDRESSES.berachain.WBTC,
  },
  {
    name: "Prime Liquid Bera ETH",
    vault: "0xB83742330443f7413DBD2aBdfc046dB0474a944e",
    accountant: "0x0B24A469d7c155a588C8a4ee24020F9f27090B0d",
    teller: "0xa6976B2211411461aB6DF4B3AAE896531Eb527df",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 198970,
    baseAsset: ADDRESSES.berachain.WETH,
  },
];

module.exports = {
  boringVaultsV0Berachain,
};
