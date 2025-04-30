const {  nullAddress,treasuryExports } = require("../helper/treasury");

const notiboyTreasury = "CGYA55OJYP6ZOBMIAEXEMVTZI67QCYQ7PJIMWQYETIYEWT4XCPZQRDTUQE";

module.exports = treasuryExports({
  algorand: {
    tokens: [ 
        nullAddress,
        '2614577662', //atard
        '1', // algo
        
     ],
    owners: [notiboyTreasury],
  },
})