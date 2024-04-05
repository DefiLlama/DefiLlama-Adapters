const { treasuryExports } = require("../helper/treasury");
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = treasuryExports({
  base: {
    owners: ["0x0000000000A6F0986c92cf1EC4d2e77aFBE1466D"],
  },
})