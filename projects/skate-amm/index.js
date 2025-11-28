const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/solana')
const { getObjects } = require("../helper/chain/sui");

const evm_config = {
  ethereum: { kernelEventEmitter: '0x6984DC28Bf473160805AE0fd580bCcaB77f4bD7C', fromBlock: 22330649 },
  bsc: { kernelEventEmitter: '0x6984DC28Bf473160805AE0fd580bCcaB77f4bD7C', fromBlock: 49126003 },
  base: { kernelEventEmitter: '0x3dDe8E4b5120875B1359b283034F9606D0f2F9eC', fromBlock: 29522359 },
  arbitrum: { kernelEventEmitter: '0x3dDe8E4b5120875B1359b283034F9606D0f2F9eC', fromBlock: 331057353 },
  hyperliquid: { kernelEventEmitter: '0x5a428F12a55d6E0ABa77Eb5B340f2ff95dE01BF5', fromBlock: 4470476 },
  plume_mainnet: { kernelEventEmitter: '0x6984DC28Bf473160805AE0fd580bCcaB77f4bD7C', fromBlock: 4574846 },
  mantle: { kernelEventEmitter: '0xD76515844574A7c3f4521704098082371ACEEeB5', fromBlock: 80184784 },
  "0g": { kernelEventEmitter: '0xFBD495862410c549f200Ce224Ad3D02a0bAe260D', fromBlock: 5961960 },
  monad: { kernelEventEmitter: '0xFBD495862410c549f200Ce224Ad3D02a0bAe260D', fromBlock: 33372521 },
}

const svm_config = {
  eclipse: [
    'BvNLQCQKxq5A7AQUsMdUqRhwXwmnYy7bkpVU67QrakJ8', // tETH/WETH (WETH)
    '8VSpqv9eAtxew8hbGjN3bWoyHCog9gFEcW42URVNpTH', // tETH/WETH (tETH)

    'ECSRM9wkFyABH55vYGoR2kjSNm3tGEFp1cT3htBWmngd', // tUSD/USDC (USDC)
    '6uoWjgNs8h7VYNmdrdHmXjty8Y8GrMjTxGcmb3EuDoM8', // tUSD/USDC (tUSD)

  ],
  solana: [
    '5XCdmwR7K2sZAxbWbkqhohnJ6X7v9ZtbuNrzrr19yHgp', // USDT/USDC (USDT)
    'FL34362VBFeMRqoRuFm3SiFwS2TAXBWhk6C2CBnjbG3E', // USDT/USDC (USDC)

    '6Fv84LR6nWFYeWRJAehHF3KXRi1RWQRQkGn3eLK3QMxb', // SOL/USDC (SOL)
    '8NGoaasGcpa8h1JjLY598UCrmxpqgpuWVJtm9F5k3sid', // SOL/USDC (USDC)

    'JBfR8XHYRF52WzTqyB14gkNVWtpPr9DUqzfuxASGLmby', // SKATE/USDC (SKATE)
    '8munm11k8XjmjkyXygXWoZadfJuweNiFztKmgNzxccWb' // SKATE/USDC (USDC)
  ]
}

const sui_config = {
  sui: ['0x6ab1e3d7c02dff309504d53fa06302cb66ce50f576432c369afe07c164c0a853']
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
  timetravel: false,
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
  const res = await sumTokens2({ api, tokenAccounts: pools, computeTokenAccount: true })
  return res;
}

Object.keys(svm_config).forEach((chain) => {
  module.exports[chain] = { tvl: svmTvl }
})

const suiTvl = async (api) => {
  const pools = sui_config[api.chain]
  const objs = await getObjects(pools)
  objs.forEach((obj) => {
    const { fields: { pool_coin0_liquidity, pool_coin1_liquidity } } = obj
    const coin0Type = pool_coin0_liquidity.type.split('<')[1].replace('>', '')
    const coin1Type = pool_coin1_liquidity.type.split('<')[1].replace('>', '')
    const coin0Amount = pool_coin0_liquidity.fields.balance
    const coin1Amount = pool_coin1_liquidity.fields.balance
    api.add(coin0Type, coin0Amount)
    api.add(coin1Type, coin1Amount)
  })
}

Object.keys(sui_config).forEach((chain) => {
  module.exports[chain] = { tvl: suiTvl }
})
