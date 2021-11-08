const sdk = require('@defillama/sdk')

const START_BLOCK = 12369621
const FACTORY = '0x1F98431c8aD98523631AE4a59f267346ea31F984'

module.exports = async function tvl(_, block) {
  const logs = (
    await sdk.api.util.getLogs({
      keys: [],
      toBlock: block,
      target: FACTORY,
      fromBlock: START_BLOCK,
      topic: 'PoolCreated(address,address,uint24,int24,address)',
    })
  ).output

  const pairAddresses = []
  const token0Addresses = []
  const token1Addresses = []
  for (let log of logs) {
    token0Addresses.push(`0x${log.topics[1].substr(-40)}`.toLowerCase())
    token1Addresses.push(`0x${log.topics[2].substr(-40)}`.toLowerCase())
    pairAddresses.push(`0x${log.data.substr(-40)}`.toLowerCase())
  }

  const pairs = {}
  // add token0Addresses
  token0Addresses.forEach((token0Address, i) => {
      const pairAddress = pairAddresses[i]
      pairs[pairAddress] = {
        token0Address: token0Address,
      }
  })

  // add token1Addresses
  token1Addresses.forEach((token1Address, i) => {
      const pairAddress = pairAddresses[i]
      pairs[pairAddress] = {
        ...(pairs[pairAddress] || {}),
        token1Address: token1Address,
      }
  })

  let balanceCalls = []

  for (let pair of Object.keys(pairs)) {
    balanceCalls.push({
      target: pairs[pair].token0Address,
      params: pair,
    })
    balanceCalls.push({
      target: pairs[pair].token1Address,
      params: pair,
    })
  }

  const tokenBalances = (
    await sdk.api.abi.multiCall({
      abi: 'erc20:balanceOf',
      calls: balanceCalls,
      block,
    })
  )

  let balances = {};
 
  sdk.util.sumMultiBalanceOf(balances, tokenBalances)

  return balances;
}
