const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");

const treasury = "0x0E43DF9F40Cc6eEd3eC70ea41D6F34329fE75986";
const dre = "0xd4eee4c318794bA6FFA7816A850a166FFf8310a9";
const dre_old = "0xF8232259D4F92E44eF84F18A0B9877F4060B26F1";
const tokens = [
  nullAddress,
  dre,
  dre_old,
  '0xB781C624397C423Cb62bAe9996cEbedC6734B76b', // dre-usd lp token
  '0x18b6963ebe82b87c338032649aaad4eec43d3ecb', // dre-usd lp token
  ADDRESSES.sonic.USDC_e
];

module.exports = treasuryExports({
  sonic: {
    tokens,
    owners: [treasury],
    ownTokens: [dre, dre_old],
    resolveLP: true,
  },
});
