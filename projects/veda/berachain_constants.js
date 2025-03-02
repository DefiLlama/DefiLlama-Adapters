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
 {
    name: "Liquid Bera BTC",
    vault: "0xC673ef7791724f0dcca38adB47Fbb3AEF3DB6C80",
    accountant: "0xF44BD12956a0a87c2C20113DdFe1537A442526B5",
    teller: "0x07951756b68427e7554AB4c9091344cB8De1Ad5a",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 200313,
    baseAsset: ADDRESSES.berachain.WBTC,
  },
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
