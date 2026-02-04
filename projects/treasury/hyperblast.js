const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const Treasury = "0x2d741ac2647707297f38c48437b4f48e6c97c624";

const HYPE = "0x9FE9991dAF6b9a5d79280F48cbb6827D46DE2EA4";

module.exports = treasuryExports({
  blast: {
    tokens: [
        nullAddress,
        ADDRESSES.blast.USDB //usdb
     ],
    owners: [Treasury],
     ownTokens: [HYPE],
  },
})