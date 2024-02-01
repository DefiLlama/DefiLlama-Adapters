const {  nullAddress,treasuryExports } = require("../helper/treasury");

const notiboyTreasury = "NOTILXUG675YH2JBO3NP5BXADEWRWHPOM5VBIWE6Z3AQU3QKGKMEPNZJRE";

module.exports = treasuryExports({
  algorand: {
    tokens: [ 
        nullAddress,
        '31566704', //usdc
        '1', // algo
        
     ],
    owners: [notiboyTreasury],
  },
})