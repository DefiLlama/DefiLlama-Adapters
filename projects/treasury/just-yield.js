const { nullAddress, treasuryExports } = require("../helper/treasury");

const Treasury = "0xeCa31b3cbD0C65CC3Ea2DE2338693B74445B0c2C";



module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',//weth
     ],
    owners: [Treasury],
  },
})