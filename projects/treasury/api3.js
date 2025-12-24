
const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x556ecbb0311d350491ba0ec7e019c354d7723ce0"
const treasury2 = "0xd9f80bdb37e6bad114d747e60ce6d2aaf26704ae"
const treasury3 = "0xe7af7c5982e073ac6525a34821fe1b3e8e432099"
const treasury4 = "0x8e03609ed680B237C7b6f8020472CA0687308b24"
const API = "0x0b38210ea11411557c13457d4da7dc6ea731b88a"


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.STETH,
        ADDRESSES.ethereum.USDC,
        "0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d"  
     ],
    owners: [treasury, treasury2, treasury3, treasury4],
    ownTokens: [API],
    resolveLP: true,
    resolveUniV3: true,
    fetchCoValentTokens: false,
  },
})
