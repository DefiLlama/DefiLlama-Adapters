const sdk = require('@defillama/sdk');
const { gmxExports } = require("../helper/gmx");
const { sumTokens2 } = require('../helper/unwrapLPs')

const tokenAddresses_arbitrum = [
  "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", //USDC
  "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f", //WBTC
  "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", //WETH
  "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", //USDT
  "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", //DAI

]



module.exports = {
  bsc: {
    tvl: sdk.util.sumChainTvls([
      gmxExports({ vault: '0x7f90C8De425e2E21F6d152e881713DE5Fe37dEAB', }),
      gmxExports({ vault: '0x2c7077cF9bd07C3BC45B4E5b8C27f8B95c6550B3', }),
    ])
  },
  arbitrum: {
    tvl: (ts, _block, _, { api }) => sumTokens2({ ...api, owner: '0xfc36be177868b05f966e57bfc01617501b1f6926', tokens: tokenAddresses_arbitrum, })
  },
}