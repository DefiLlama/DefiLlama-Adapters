const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasuryARB = "0x9474b771fb46e538cfed114ca816a3e25bb346cf";
const treasuryETH = "0xa54074b2cc0e96a43048d4a68472F7F046aC0DA8"
const ctx = "0x321C2fE4446C7c963dc41Dd58879AF648838f98D"
module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasuryARB],
  },
  ethereum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasuryETH],
    ownTokens: [ctx],
    
  },
})