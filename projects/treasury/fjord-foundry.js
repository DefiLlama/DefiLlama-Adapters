const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");

const treasury = "0xcA518c4DB97ECCe85cC82DE3C2B93D8f8b536ca5" // https://x.com/dcfgod/status/1815970805878034797

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.USDT
     ],
    owners: [treasury],
  },

})