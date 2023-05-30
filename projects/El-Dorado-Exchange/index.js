const sdk = require('@defillama/sdk');
const { gmxExports } = require("../helper/gmx");
const { sumTokens2 } = require('../helper/unwrapLPs');

module.exports = {
  bsc: {
    tvl: sdk.util.sumChainTvls([
      gmxExports({ vault: '0x7f90C8De425e2E21F6d152e881713DE5Fe37dEAB', }),
      gmxExports({ vault: '0x2c7077cF9bd07C3BC45B4E5b8C27f8B95c6550B3', }),
      async (_, _1, _2, { api }) => {
        const vault = '0xF1D7e3f06aF6EE68E22baFd37E6a67b1757c35a9'
        const tokens = await api.call({  abi: 'address[]:fundingTokenList', target: vault})
        return sumTokens2({ api, owner: vault, tokens, })
      }
    ])
  },
  arbitrum: {
    tvl: sdk.util.sumChainTvls([
      async (_, _1, _2, { api }) => {
        const vault = '0xfc36be177868b05f966e57bfc01617501b1f6926'
        const tokens = await api.call({  abi: 'address[]:fundingTokenList', target: vault})
        return sumTokens2({ api, owner: vault, tokens, })
      },
      async (_, _1, _2, { api }) => {
        const vault = '0x24b6137A5fe9d058baf654bb73aB857F57DF8BB4'
        const tokens = await api.call({  abi: 'address[]:fundingTokenList', target: vault})
        return sumTokens2({ api, owner: vault, tokens, })
      },
    ])
  },
  hallmarks: [
    [Math.floor(new Date('2023-05-30')/1e3), 'Protocol was hacked!'],
  ],
}
