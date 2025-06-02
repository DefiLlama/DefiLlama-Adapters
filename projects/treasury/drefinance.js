const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");

const treasury = "0x0E43DF9F40Cc6eEd3eC70ea41D6F34329fE75986";
const dre = "0xF8232259D4F92E44eF84F18A0B9877F4060B26F1";
const tokens = [
  nullAddress,
  dre,
  tokens.DRE_USDC_LP
  ADDRESSES.ethereum.WETH, // WETH
];

module.exports = treasuryExports({
  sonic: {
    tokens,
    owners: [treasury, operations],
    ownTokens: [dre],
    resolveLP: true,
  },
});
