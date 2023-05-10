const { treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        "0xdac17f958d2ee523a2206206994597c13d831ec7"
     ],
    owners: [
      "0xa9466EaBd096449d650D5AEB0dD3dA6F52FD0B19",
      "0xd6d4Bcde6c816F17889f1Dd3000aF0261B03a196"
    ],
    ownTokens: ["0x33349b282065b0284d756f0577fb39c158f935e6"],
  },
})