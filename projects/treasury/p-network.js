const { nullAddress, treasuryExports } = require("../helper/treasury");


const treasury3 = "0xdd92eb1478d3189707ab7f4a5ace3a615cdd0476"

const PNT = "0x89ab32156e46f46d02ade3fecbe5fc4243b9aaed"
const ethPNT = "0xf4eA6B892853413bD9d9f1a5D3a620A0ba39c5b2"   // 1 ethPNT = 1 PNT

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury3],
    ownTokens: [PNT, ethPNT],
  },
})