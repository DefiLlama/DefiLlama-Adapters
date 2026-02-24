const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");


module.exports = treasuryExports({
  base: {
    owners: [
        '0xFfC60ed4c5ee48beb646dD81521842A4a4d19980', 
    ],
    tokens: [
        nullAddress,
        ADDRESSES.base.USDC
    ],
    ownTokens: [],
  },
})