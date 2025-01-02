const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x0c415efd785b8308e42c75532d1231a6281ebee2";
const FCTR = "0x6dd963c510c2d2f09d5eddb48ede45fed063eb36"

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury],
    ownTokens: [FCTR],
  },
})