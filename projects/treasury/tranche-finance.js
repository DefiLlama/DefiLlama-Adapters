const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");

const treasury = "0x4632E2E1Ea012fD5d84804c3B36eC12560eCC0aA";
const SLICE = "0x0AeE8703D34DD9aE107386d3eFF22AE75Dd616D1"

module.exports = treasuryExports({
  ethereum: {
    tokens: [nullAddress],
    owners: [treasury],
    ownTokens: [SLICE],
  },
});