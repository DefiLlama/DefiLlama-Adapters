
const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x03ca52e482912308c287d09ec941b996c18668f5";
const treasury2 = "0x1633b453c3ca5a244c66f4418ff5120282370053"
const APE = "0x4d224452801aced8b2f0aebe155379bb5d594381"


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.STETH,
        
     ],
    owners: [treasury, treasury2],
    ownTokens: [APE],
   // resolveLP: true,
   // resolveUniV3: true,
  },
})