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
        ADDRESSES.ethereum.STETH,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.WBTC,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.WSTETH,
        ADDRESSES.ethereum.USDT
     ],
    owners: [treasuryETH],
    ownTokens: [INST],
  },
})