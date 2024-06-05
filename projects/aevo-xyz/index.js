const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owners: [
        '0x4082C9647c098a6493fb499EaE63b5ce3259c574', // L1ChugSplashProxy
        '0x426d1F3866BfcDF4d0efEfeD1Ba3c5E06CaECbE6', // L1SwapVault
      ],
      tokens: [
        ADDRESSES.null,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.WBTC,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.STETH,
        ADDRESSES.ethereum.SDAI,
      ]
    })
  },
  arbitrum: { 
    tvl: sumTokensExport({ 
      owners: [
        '0x80d40e32fad8be8da5c6a42b8af1e181984d137c', // Bridged USDC 
        '0x7711C90bD0a148F3dd3f0e587742dc152c3E9DDB', // Native USDC
        '0x90bFB3C35ddfBbA42D998414F0ff1eADD430E161', // WETH
      ], 
      fetchCoValentTokens: true, 
    }) 
  },
  optimism: { 
    tvl: sumTokensExport({ 
      owners: [
        '0xfff4a34925301d231ddf42b871c3b199c1e80584', // Bridged USDC 
        '0x7809621a6D7e61E400853C64b61568aA773A28Ef', // Native USDC
        '0x5c7Dd6cb73d93879E94F20d103804C495A10aE7e', // WETH
      ], 
      fetchCoValentTokens: true, 
    }) 
  },
}
