const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const Treasury = "addr1qx9sltr8w7y3hyjav340zunarmegsvu009ny2k5neccal0p3yzmswj59yx7vn630qh3ce7yjflahhjr3a0a2xkhf30eq3rd5k5";



module.exports = treasuryExports({
  cardano: {
    tokens: [ 
        nullAddress,
     ],
    owners: [Treasury],
  },
})