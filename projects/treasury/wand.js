const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports } = require("../helper/treasury")

const config = {
  blast: {
    owners: [
      "0x462bd2d3c020f6986c98160bc4e189954f49634b", // treasury
    ],
    tokens: [ 
      ADDRESSES.null, // $ETH
      ADDRESSES.blast.USDB  // $USDB
   ],
  },
}

module.exports = treasuryExports(config)