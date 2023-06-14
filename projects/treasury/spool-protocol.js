const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");

const treasury = "0xf6bc2e3b1f939c435d9769d078a6e5048aabd463";
const SPOOL = "0x40803cEA2b2A32BdA1bE61d3604af6a814E70976"
const LP = "0xF3b675df63FB4889180d290A338fc15C0766fd64"

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.DAI,
      ADDRESSES.ethereum.USDC

    ],
    owners: [treasury],
    ownTokens: [SPOOL, LP],
  },
});
