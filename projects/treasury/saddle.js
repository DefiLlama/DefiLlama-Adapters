const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        '0x5575552988a3a80504bbaeb1311674fcfd40ad4b',
        '0x2cab3abfc1670d1a452df502e216a66883cdf079',
        ADDRESSES.arbitrum.FRAX,
        ADDRESSES.arbitrum.USDC,
     ],
    owners: ['0x8e6e84ddab9d13a17806d34b097102605454d147'],
    ownTokens: [],
  },
})