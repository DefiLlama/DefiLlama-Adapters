const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x57a8865cfB1eCEf7253c27da6B4BC3dAEE5Be518";
const vestingAddress = "0x44Aa9c5a034C1499Ec27906E2D427b704b567ffe";
const GTC = "0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC, //USDC
        '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3',//rad
        '0xE54f9E6Ab80ebc28515aF8b8233c1aeE6506a15E',//pasta
     ],
    owners: [treasury, vestingAddress],
    ownTokens: [GTC],
  },
})