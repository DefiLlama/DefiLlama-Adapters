const { treasuryExports } = require("../helper/treasury");
const ADDRESSES = require('../helper/coreAssets.json')

const treasury = "0x0fCa5194baA59a362a835031d9C4A25970effE68";

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        ADDRESSES.null,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.DAI,
     ],
    owners: [treasury],
  },
})
