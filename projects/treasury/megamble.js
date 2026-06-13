const { treasuryExports } = require("../helper/treasury");
const { nullAddress } = require('../helper/tokenMapping');

module.exports = treasuryExports({
    megaeth: {
      owners: ['0x21CbC99a2E8c68F1C2955991E07c0C22ea895Da1'],
      tokens: [ 
        nullAddress,
     ],
    },
  })