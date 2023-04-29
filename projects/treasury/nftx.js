const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const nftxDao = "0x40D73Df4F99bae688CE3C23a01022224FE16C7b2";

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
     ],
    owners: [nftxDao]
  },
})