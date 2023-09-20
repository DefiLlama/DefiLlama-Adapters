const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owner: '0x4082C9647c098a6493fb499EaE63b5ce3259c574', tokens: [
        ADDRESSES.null,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.WBTC,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.STETH,
      ]
    })
  },
  arbitrum: { tvl: sumTokensExport({ owner: '0x80d40e32fad8be8da5c6a42b8af1e181984d137c', fetchCoValentTokens: true, }) },
  optimism: { tvl: sumTokensExport({ owner: '0xfff4a34925301d231ddf42b871c3b199c1e80584', fetchCoValentTokens: true, }) },
}