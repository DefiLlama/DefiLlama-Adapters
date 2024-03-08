const { treasuryExports } = require("../helper/treasury")

const config = {
  blast: {
    owners: [
      "0x462bd2d3c020f6986c98160bc4e189954f49634b", // treasury
    ],
    tokens: [ 
      '0x0000000000000000000000000000000000000000', // $ETH
      '0x4300000000000000000000000000000000000003'  // $USDB
   ],
  },
}

module.exports = treasuryExports(config)