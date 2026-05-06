const ADDRESSES = require("../helper/coreAssets.json");

const boringVaultsEthereum = [
  {
    name: "Solid USD",
    vault: "0x6E575AE5e1A12e910641183F555Fad62eD1481F2",
    accountant: "0x10f3996904F1fA09Db48e5d46AAdD6D9fd516eFe",
    teller: "0x43F2face25Bb22d296B9Ab643Dac7755D89632E5",
    lens: "0x074F543E7DaA7C67F77bfD8C41C79127c4dd80d9",
    startBlock: 22651939,
    baseAsset: ADDRESSES.ethereum.USDC,
  },
  {
    name: "Solid ETH",
    vault: "0xf9039d4f49686F34936b6937D13bBbe413f910c4",
    accountant: "0x803ed5a218a7704fC8697d36079F70df974Abb11",
    teller: "0x4149c11b479B26080428Dc5e688F4D27253C4783",
    lens: "0x074F543E7DaA7C67F77bfD8C41C79127c4dd80d9",
    startBlock: 24822485,
    baseAsset: ADDRESSES.ethereum.WETH,
  },
];

module.exports = {
  boringVaultsEthereum,
};
