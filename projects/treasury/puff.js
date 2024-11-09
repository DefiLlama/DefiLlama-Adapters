const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  mantle: {
    tokens: [ 
        nullAddress,
        "0xcda86a272531e8640cd7f1a92c01839911b90bb0",
     ],
    owners: ["0x940e79c49d73ce46884f57087e0c78b608da57c6"],
    ownTokens: ["0x26a6b0dcdcfb981362afa56d581e4a7dba3be140"],
    uniV3nftsAndOwners: [["0xE9baC8f0100C3229AbddE01D692c6e5791d3b544", "0x940e79c49d73ce46884f57087e0c78b608da57c6"]],
  },
})