const {  nullAddress,treasuryExports } = require("../helper/treasury");

const Treasury1 = "0xa67488eEAa9C15a4F6f5A3E98f45041e34310677";
const Treasury2 = "0x4883A3696768c226EF917BCc32bDBA67F14e2b4c";

const ITP = "0x2b1D36f5B61AdDAf7DA7ebbd11B35FD8cfb0DE31";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress
     ],
    owners: [Treasury1,Treasury2],
    ownTokens: [ITP],
  },
})