const {  nullAddress,treasuryExports } = require("../helper/treasury");

const Treasury = "0xf81ab897e3940e95d749ff2e1f8d38f9b7cbe3cf";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
        "0x8971dFb268B961a9270632f28B24F2f637c94244",
        "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"
     ],
    owners: [Treasury],
  },
})