const { nullAddress, treasuryExports } = require("../helper/treasury");

const nftxDao = "0x40D73Df4F99bae688CE3C23a01022224FE16C7b2";
const nftx = "0x87d73E916D7057945c9BcD8cdd94e42A6F47f776"

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
     ],
    owners: [nftxDao],
    ownTokens: [nftx],
  },
})