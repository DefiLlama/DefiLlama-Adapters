const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/solana')

const evm_config = {
  ethereum: { kernelEventEmitter: '0x6984DC28Bf473160805AE0fd580bCcaB77f4bD7C', fromBlock: 22330649 },
  bsc: { kernelEventEmitter: '0x6984DC28Bf473160805AE0fd580bCcaB77f4bD7C', fromBlock: 49126003 },
  base: { kernelEventEmitter: '0x3dDe8E4b5120875B1359b283034F9606D0f2F9eC', fromBlock: 29522359 },
  arbitrum: { kernelEventEmitter: '0x3dDe8E4b5120875B1359b283034F9606D0f2F9eC', fromBlock: 331057353 }
}

const svm_config = {
  eclipse: [
    '4wyA3MfcGu9PmFiegCZ3itNADVxmTrnKt4MDFFRxzctm' // tETH/WETH
  ],
  solana: [
    '78auJTs52UmJbn82tCptdMTgQzgTLA2hg4AS6RKnwkxQ', // USDT/USDC
    'CjfBGMQJTw4rHFCGdF5U4GMPBK7sE4x1rgatjHyqCocG' // WSOL/USDC
  ]
}

const eventAbis = {
  pool_created: "event PoolCreated(address kernelPool, address pool, address token0, address token1, uint24 fee)",
}

const abis = {
  balances_available: "function balancesAvailable() view returns (uint256 amount0, uint256 amount1)"
}

module.exports = {
  methodology: "Assets deployed on periphery chains. For EVM chains, we track the token balances in the pools. For SVM chains, we track the token balances owned by the pool addresses.",
  start: 1742169600, // '2025-03-17 GMT+0'
  timetravel: false, // Set to false for Solana and Eclipse chains
}

const evmTvl = async (api) => {
  const { kernelEventEmitter, fromBlock } = evm_config[api.chain]
  const logs = await getLogs2({ api, target: kernelEventEmitter, eventAbi: eventAbis.pool_created, fromBlock, onlyArgs: true })
  const balances = await api.multiCall({ calls: logs.map(([_, pool]) => ({ target: pool })), abi: abis.balances_available })
  logs.forEach(([_, __, token0, token1], i) => {
    const { amount0, amount1 } = balances[i]
    api.add(token0, amount0)
    api.add(token1, amount1)
  })
}

Object.keys(evm_config).forEach((chain) => {
  module.exports[chain] = { tvl: evmTvl }
})

const svmTvl = async (api) => {
  const pools = svm_config[api.chain]
  return sumTokens2({ api, owners: pools })
}

Object.keys(svm_config).forEach((chain) => {
  module.exports[chain] = { tvl: svmTvl }
})