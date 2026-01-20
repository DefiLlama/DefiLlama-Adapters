const { nullAddress, treasuryExports } = require("../helper/treasury");
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = treasuryExports({
  sonic: {
    owners: ['0x12684d18BDBA8e31936f40aBcE1175366874114f',],
    tokens: [
      nullAddress,
      ADDRESSES.sonic.USDC_e
    ],
  },
});