
const { getLogs } = require('../helper/cache/getLogs')
const { transformDexBalances } = require('../helper/portedTokens')

const factory = '0x16eD649675e6Ed9F1480091123409B4b8D228dC1'
module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL counts the liquidity of the pools on each chain.',
}

const config = {
  ethereum: { fromBlock: 12965000, },
  polygon: { fromBlock: 12965000, },
  arbitrum: { fromBlock: 101851523, },
}

Object.keys(config).forEach(chain => {
  const { fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      let logs = await getLogs({
        api,
        target: factory,
        eventAbi: "event PairCreated(address indexed token0, address indexed token1, address pair, uint256)",
        onlyArgs: true,
        fromBlock,
      })
      let pairs = logs.map(log => log.pair)
      const names = await api.multiCall({ abi: 'string:name', calls: pairs })
      logs = logs.filter((pair, i) => names[i] === 'SweepnFlip LPs')
      pairs = logs.map(log => log.pair)
      const bals0 = await api.multiCall({ abi: 'erc20:balanceOf', calls: pairs.map((pair, i) => ({ target: logs[i].token0, params: pair })) })
      const bals1 = await api.multiCall({ abi: 'erc20:balanceOf', calls: pairs.map((pair, i) => ({ target: logs[i].token1, params: pair })) })
      return transformDexBalances({ chain, data: logs.map((l, i) => ({ token0Bal: bals0[i], token1Bal:  bals1[i], token0: l.token0, token1: l.token1 })) })
    }
  }
})