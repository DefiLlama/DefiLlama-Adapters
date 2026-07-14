const { getLogs, getLogs2 } = require('../projects/helper/cache/getLogs')
const { transformDexBalances } = require('../projects/helper/portedTokens')
const { buildProtocolExports } = require('./utils')

const PAIR_CREATED_TOPIC = '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9'
const PAIR_CREATED_ABI = 'event PairCreated(address indexed token0, address indexed token1, address pair, uint256 )'

// Uniswap V2 forks that enumerate pairs via the PairCreated event logs (instead of allPairs/allPairsLength),
// then value each pool by reading token0/token1 balanceOf(pair) and passing through transformDexBalances.
function uniV2LogsTvl({ factory, fromBlock, useGetLogs2 }) {
  return async (api) => {
    const logsFn = useGetLogs2 ? getLogs2 : getLogs
    const logs = await logsFn({
      api,
      target: factory,
      topics: [PAIR_CREATED_TOPIC],
      eventAbi: PAIR_CREATED_ABI,
      onlyArgs: useGetLogs2 ? undefined : true,
      fromBlock,
    })
    const tok0Bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: logs.map(i => ({ target: i.token0, params: i.pair })) })
    const tok1Bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: logs.map(i => ({ target: i.token1, params: i.pair })) })
    return transformDexBalances({
      chain: api.chain, data: logs.map((log, i) => ({
        token0: log.token0,
        token0Bal: tok0Bals[i],
        token1: log.token1,
        token1Bal: tok1Bals[i],
      }))
    })
  }
}

function uniV2LogsExportFn(chainConfigs, options = {}) {
  const result = {}
  Object.entries(chainConfigs).forEach(([chain, config]) => {
    const cfg = typeof config === 'string' ? { factory: config } : config
    result[chain] = { tvl: uniV2LogsTvl({ ...options, ...cfg }) }
  })
  return result
}

const configs = {
  'kaleidoswap': {
    misrepresentedTokens: true,
    xai: { factory: '0x6858a6c3484b7b033B748261e550FC20c479b063', fromBlock: 374538 },
    arbitrum: { factory: '0x427a733Bd14a949eA771a558f6934bB0004c0c4E', fromBlock: 181235376 },
  },
  'mantleswap': {
    misrepresentedTokens: true,
    mantle: { factory: '0x5c84e5d27fc7575D002fe98c5A1791Ac3ce6fD2f', fromBlock: 5964 },
  },
  'quainance': {
    misrepresentedTokens: true,
    quai: { factory: '0x0018A110b6cA369DCf5Ab062C72F049E93B9eDe2', fromBlock: 8906017, useGetLogs2: true },
  },
}

module.exports = buildProtocolExports(configs, uniV2LogsExportFn)
