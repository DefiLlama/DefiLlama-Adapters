const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");

const treasury = "0x0E43DF9F40Cc6eEd3eC70ea41D6F34329fE75986";
const rzr = "0xb4444468e444f89e1c2CAc2F1D3ee7e336cBD1f5";
const tokens = [
  nullAddress,
  rzr,
  ADDRESSES.sonic.USDC_e,
  ADDRESSES.sonic.scUSD,
];

module.exports = treasuryExports({
  sonic: {
    tokens,
    owners: [treasury],
    ownTokens: [rzr],
    resolveLP: true,
  },
  ethereum: {
    tokens,
    owners: [treasury],
    ownTokens: [rzr],
    resolveLP: true,
  },
});
