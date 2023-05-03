const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xfba3b455211a3a09689788Ac3A14B4F8Baf012B4";
const NEU = "0xdA51015b73cE11F77A115Bb1b8a7049e02dDEcf0";
const esNEU = "0xdeBB612442159b34c24B7BAF20b1CC3218a06925"
const sbfNEU = "0x44F0685482A7180785e309947176C34D0A3d9187"

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
        "0x422B5A91b5Cdef61D3400671CCdd5bE22C7CE655",
        "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
     ],
    owners: [treasury],
    ownTokens: [NEU, esNEU, sbfNEU],
  },
})