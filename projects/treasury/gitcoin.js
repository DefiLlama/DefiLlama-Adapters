const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x57a8865cfB1eCEf7253c27da6B4BC3dAEE5Be518";
const vestingAddress = "0x44Aa9c5a034C1499Ec27906E2D427b704b567ffe";
const treasury2 = "0xde21f729137c5af1b01d73af1dc21effa2b8a0d6"
const GTC = "0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC, //USDC
        '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3',//rad
        '0xE54f9E6Ab80ebc28515aF8b8233c1aeE6506a15E',//pasta
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.UNI,
        "0x31c8eacbffdd875c74b94b077895bd78cf1e64a3",
        "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72"

     ],
    owners: [treasury, vestingAddress, treasury2],
    ownTokens: [GTC],
  },
})