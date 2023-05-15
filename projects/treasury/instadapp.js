const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const Treasury = "0xf81ab897e3940e95d749ff2e1f8d38f9b7cbe3cf";
const treasuryETH = "0x28849d2b63fa8d361e5fc15cb8abb13019884d09"

const INST = "0x6f40d4A6237C257fff2dB00FA0510DeEECd303eb"

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.arbitrum.USDC,
        "0x8971dFb268B961a9270632f28B24F2f637c94244",
        ADDRESSES.optimism.DAI
     ],
    owners: [Treasury],
  },
  ethereum: {
    tokens: [ 
        nullAddress,
        "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
        "0xdAC17F958D2ee523a2206206994597C13D831ec7"
     ],
    owners: [treasuryETH],
    ownTokens: [INST],
  },
})