const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const treasury ="0x744d16d200175d20e6d8e5f405aefb4eb7a962d1"
const treasury2 = "0x97990b693835da58a281636296d2bf02787dea17"
const YAM = "0x0AaCfbeC6a24756c20D41914F2caba817C0d8521"

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,

     ],
    owners: [treasury, treasury2],
    ownTokens: [YAM],
  },
})