const { nullAddress, treasuryExports } = require("../helper/treasury");

// https://zksync2-mainnet.zkscan.io/address/0x621425a1Ef6abE91058E9712575dcc4258F8d091/transactions
module.exports = treasuryExports({
  era: {
    tokens: [ 
        nullAddress,
        '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',//USDC
     ],
    owners: ["0x621425a1Ef6abE91058E9712575dcc4258F8d091"],
  },
})