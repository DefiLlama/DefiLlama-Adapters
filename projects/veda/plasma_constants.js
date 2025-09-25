const ADDRESSES = require("../helper/coreAssets.json");

const boringVaultsV0Plasma = [
  {
    name: "Plasma USD",
    vault: "0xd1074E0AE85610dDBA0147e29eBe0D8E5873a000",
    accountant: "0x737f2522d09E58a3Ea9dcCFDB127dD0dF5eB3F18",
    teller: "0x4E7d2186eB8B75fBDcA867761636637E05BaeF1E",
    lens: "0xC67Af7c42b64c2Bb5BdF20716cCFa995a07F6903",
    startBlock: 687884,
    baseAsset: ADDRESSES.plasma.USDT0
  },
];

module.exports = {
  boringVaultsV0Plasma,
};
