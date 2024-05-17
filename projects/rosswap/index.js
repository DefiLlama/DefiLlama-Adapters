const { getLogs } = require('../helper/cache/getLogs')
const { transformDexBalances } = require('../helper/portedTokens')

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: '0x232bF8d9cED464a75632657Cb2554880Acdcac1B',
    eventAbi: "event PairCreated(address indexed token0, address indexed token1, address pair, uint256)",
    onlyArgs: true,
    fromBlock: 45401,
  })
  const getReservesABI = 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'

  const pairs = logs.map(log => log.pair)
  const res = await api.multiCall({ abi: getReservesABI, calls: pairs,  })
  const data = []
  res.forEach((r, i) => {
    if (!r) return;
    data.push({
      token0: logs[i].token0,
      token1: logs[i].token1,
      token0Bal: r._reserve0,
      token1Bal: r._reserve1,
    })
  })
  return transformDexBalances({ chain: api.chain, data, })
}

module.exports = {
  misrepresentedTokens: true,
  fsc: { tvl, },
} 