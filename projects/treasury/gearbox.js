const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

// Treasury
const treasury = "0x7b065Fcb0760dF0CEA8CFd144e08554F3CeA73D1";
const GEAR = "0xBa3335588D9403515223F109EdC4eB7269a9Ab5D";


module.exports = treasuryExports({
  ethereum: {
    tokens: [
      // Ethereum Assets
      nullAddress,
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.WBTC,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.DAI,
      ADDRESSES.ethereum.WSTETH,//wsteth
    ],
    owners: [treasury],
    ownTokens: [GEAR]
  },
})
