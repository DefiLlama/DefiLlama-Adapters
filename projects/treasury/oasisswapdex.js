const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xe0a9B8DeF6d85eb7D828f706635402334D564b0f";
const MultisigTreasury = "0x8B059bF6cE7c279a5BfEc006F439Db1E5c4A924c"

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.arbitrum.USDC, //USDC
     ],
    owners: [treasury, MultisigTreasury],
  },
})