const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')
const factories = [
  // { target: '0x36bbb126e75351c0dfb651e39b38fe0bc436ffd2', fromBlock: 21456599, },
  { target: '0x25a55f9f2279a54951133d503490342b50e5cd15', fromBlock: 25535459, token3: true, },
]

module.exports = {
  methodology:
    "TVL accounts for the liquidity on all StableSwap pools, using the TVL chart on https://pancakeswap.finance/info?type=stableSwap as the source.",
  bsc: {
    tvl: async (_, _b, _cb, { api }) => {
      const configs = await Promise.all(factories.map(getTvlConfig))
      return sumTokens2({ api, ownerTokens: configs.flat() })

      async function getTvlConfig({ target, fromBlock, token3 }) {
        let topic = '0xa9551fb056fc743efe2a0a34e39f9769ad10166520df7843c09a66f82e148b97'
        let eventAbi = 'event NewStableSwapPair(address indexed swapContract, address indexed tokenA, address indexed tokenB)'
        let getOwnTokens = logs => logs.map(i => ([[i.tokenA, i.tokenB], i.swapContract]))
        if (token3) {
          topic = '0x48dc7a1b156fe3e70ed5ed0afcb307661905edf536f15bb5786e327ea1933532'
          eventAbi = 'event NewStableSwapPair(address indexed swapContract, address tokenA, address tokenB, address tokenC, address LP)'
          getOwnTokens = logs => logs.map(i => ([[i.tokenA, i.tokenB, i.tokenC], i.swapContract]))
        }

        const logs = await getLogs({
          api,
          target,
          topics: [topic],
          fromBlock,
          eventAbi,
          onlyArgs: true,
        })

        return getOwnTokens(logs)
      }
    }
  },
};
