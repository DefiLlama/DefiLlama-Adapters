const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const ETH = "0x0000000000000000000000000000000000000000";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", //USDC
        "0xd26114cd6EE289AccF82350c8d8487fedB8A0C07", //OMG
        "0xB8c77482e45F1F44dE1745F52C74426C631bDD52", //BNB

     ],
    owners: [treasury],
    ownTokens: [ETH, WETH],
  },
})