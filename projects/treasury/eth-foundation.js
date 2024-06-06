const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae";
const WETH = ADDRESSES.ethereum.WETH;
const ETH = ADDRESSES.null;


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC, //USDC
        "0xd26114cd6EE289AccF82350c8d8487fedB8A0C07", //OMG
        ADDRESSES.ethereum.BNB, //BNB
        WETH
     ],
    owners: [treasury],
  },
})