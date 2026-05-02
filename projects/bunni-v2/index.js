const { getLogs2 } = require("../helper/cache/getLogs")

const config = {
  ethereum: { factories: ['0x000000dceb71f3107909b1b748424349bfde5493', '0x000000000049c7bcbca294e63567b4d21eb765f1'], fromBlock: 21747552 },
  base: { factories: ['0x000000dceb71f3107909b1b748424349bfde5493', '0x000000000049c7bcbca294e63567b4d21eb765f1'], fromBlock: 25786936 },
  arbitrum: { factories: ['0x000000dceb71f3107909b1b748424349bfde5493', '0x000000000049c7bcbca294e63567b4d21eb765f1'], fromBlock: 301323941 },
  unichain: { factories: ['0x000000dceb71f3107909b1b748424349bfde5493', '0x00000091cb2d7914c9cd196161da0943ab7b92e1', '0x000000000049c7bcbca294e63567b4d21eb765f1'], fromBlock: 11682827 },
  bsc: { factories: ['0x000000dceb71f3107909b1b748424349bfde5493', '0x000000000049c7bcbca294e63567b4d21eb765f1'], fromBlock: 48224121 },
}

const abis = {
  poolBalances: 'function poolBalances(bytes32) view returns (uint256 token0, uint256 token1)'
}

const eventAbis = {
  newBunni: 'event NewBunni (address indexed bunniToken, bytes32 indexed poolId)'
}

const tvl = async (api) => {
  const chain = api.chain
  const safeBlock = await api.getBlock() - 300
  const { factories, fromBlock } = config[chain]

  for (const factory of factories) {
    // the protocol is hacked
    const logs = await getLogs2({ api, target: factory, eventAbi: eventAbis.newBunni, fromBlock, toBlock: safeBlock, onlyUseExistingCache: true })
    const bunnis = logs.map(({ bunniToken }) => bunniToken)
    const poolIds = logs.map(({ poolId }) => poolId)

    const [token0s, token1s, balances] = await Promise.all([
      api.multiCall({ abi: 'address:token0', calls: bunnis }),
      api.multiCall({ abi: 'address:token1', calls: bunnis }),
      api.multiCall({ abi: abis.poolBalances, calls: poolIds, target: factory, permitFailure: true })
    ])

    const balances0 = balances.map(b => b?.token0 ?? 0)
    const balances1 = balances.map(b => b?.token1 ?? 0)

    api.add(token0s, balances0)
    api.add(token1s, balances1)
    
  }
}

module.exports.doublecounted = true

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl }
})