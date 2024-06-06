const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");

const treasury = "0x558c8eb91F6fd83FC5C995572c3515E2DAF7b7e0";
const operations = "0xB7bE82790d40258Fd028BEeF2f2007DC044F3459";
const ipor = "0x1e4746dC744503b53b4A082cB3607B169a289090";
const tokens = [
  nullAddress,
  ADDRESSES.ethereum.WETH, // WETH
];

module.exports = treasuryExports({
  ethereum: {
    tokens,
    owners: [treasury, operations],
    ownTokens: [ipor],
    resolveLP: true,
  },
});
