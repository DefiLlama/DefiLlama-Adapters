const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.USDT,
    ],
    owners: [
        '0xA4aA40042EfC208fA5F329485a5B3Aa569DF66C7', 
        '0x9bfc2038C0CECC85b2dAb0e4ff9e4FfdAdE58036', 
        '0x713d0c63492B156E5d7B59AB96A3895312a6939a',
    ]
  },
})