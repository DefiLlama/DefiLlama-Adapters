const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.USDT
     ],
    owners: [
      "0xa9466EaBd096449d650D5AEB0dD3dA6F52FD0B19",
      "0xd6d4Bcde6c816F17889f1Dd3000aF0261B03a196"
    ],
    ownTokens: ["0x33349b282065b0284d756f0577fb39c158f935e6"],
  },
})