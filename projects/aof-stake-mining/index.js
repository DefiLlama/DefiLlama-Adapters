const { treasuryExports } = require("../helper/treasury");
const { nullAddress } = require('../helper/tokenMapping');

module.exports = treasuryExports({
    metis: {
      owners: ['0x946D86422775E7B32F3F8f0580504EADccF9b800'],
      tokens: [ 
        nullAddress,
     ],
    },
  })