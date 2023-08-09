const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7";
const vestingAddress = "0xd7a029db2585553978190db5e85ec724aa4df23f"
const treasury2 = "0x690f0581ececcf8389c223170778cd9d029606f2"


const ENS= "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC, //USDC
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.LINK

     ],
    owners: [treasury, vestingAddress, treasury2],
    ownTokens: [ENS],
  },
})