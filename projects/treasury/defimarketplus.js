const { treasuryExports } = require("../helper/treasury");
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        ADDRESSES.arbitrum.USDC_CIRCLE,
        ADDRESSES.arbitrum.WBTC
     ],
    owners: ['0x68d60e869a77ae1ceB546c07F3351e7D899b0Ce3'],
  },
})
