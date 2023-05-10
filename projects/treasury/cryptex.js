const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasuryARB = "0x9474b771fb46e538cfed114ca816a3e25bb346cf";
const treasuryETH = "0xa54074b2cc0e96a43048d4a68472F7F046aC0DA8"
const treasury2 = "0xa70b638B70154EdfCbb8DbbBd04900F328F32c35"
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
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "0x514910771AF9Ca656af840dff83E8264EcF986CA"
     ],
    owners: [treasuryETH, treasury2],
    ownTokens: [ctx],
    
  },
})