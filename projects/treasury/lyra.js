const { nullAddress, treasuryExports } = require("../helper/treasury");
const ADDRESSES = require('../helper/coreAssets.json')

const treasury_arb = "0x2ccf21e5912e9ecccb0ecdee9744e5c507cf88ae";
const treasury_eth = "0xEE86E99b42981623236824D33b4235833Afd8044";
const treasury_op = "0xD4C00FE7657791C2A43025dE483F05E49A5f76A6";

const lyra_eth = "0x01BA67AAC7f75f647D94220Cc98FB30FCc5105Bf";
const lyra_arb = "0x079504b86d38119F859c4194765029F692b7B7aa";
const lyra_op = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
      ADDRESSES.arbitrum.USDC,
      ADDRESSES.arbitrum.WETH,
     ],
    owners: [treasury_arb],
    ownTokens: [lyra_arb],
  },
  ethereum: {
    tokens: [ 
      ADDRESSES.ethereum.USDC,
     ],
    owners: [treasury_eth],
    ownTokens: [lyra_eth],
  },
  optimism: {
    tokens: [ 
      ADDRESSES.optimism.OP,
      ADDRESSES.optimism.sUSD,
      ADDRESSES.optimism.WETH,
     ],
    owners: [treasury_op],
    ownTokens: [lyra_op],
  },
})