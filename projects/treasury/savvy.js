const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x4f54cab19b61138e3c622a0bd671c687481ec030";
const SVY = "0x43aB8f7d2A8Dd4102cCEA6b438F6d747b1B9F034"
module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
        '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
        '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
     ],
    owners: [treasury,],
    ownTokens: [SVY],
  },
})