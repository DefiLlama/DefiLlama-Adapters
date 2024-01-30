const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')
const { queryAllium } = require('../helper/allium')

async function getEigenPods(timestamp) {
  for (let i = 1; i < 4; i++) {
    const eigenPods = await queryAllium(`
 select
  sum(balance) as sum
 from
  (
    select
      params
    from
      ethereum.decoded.logs
    where
      address = '0x91e677b07f7af907ec9a428aafa9fc14a0d3a338'
      and name = 'PodDeployed'
  ) pods, (
    select
  balance,
      WITHDRAWAL_ADDRESS,
  slot_timestamp
    from beacon.validator.balances
    where
      status = 'active_ongoing'
  and slot_timestamp = '${new Date(timestamp * 1e3 - i * 24 * 3600e3).toISOString().split('T')[0]}T23:59:59'
  ) beacon where pods.params['eigenPod'] = beacon.WITHDRAWAL_ADDRESS`)
    const sum = eigenPods[0]?.["sum"]
    if (sum !== null) {
      return sum
    }
  }
  throw new Error("Empty eigenpods")
}

async function tvl(timestamp, _b, _cb, { api, }) {
  /*
  const podLogs = await getLogs({
    api,
    target: '0x91E677b07F7AF907ec9a428aafA9fc14a0d3A338',
    topics: ['0x21c99d0db02213c32fff5b05cf0a718ab5f858802b91498f80d82270289d856a'],
    eventAbi: "event PodDeployed (address indexed eigenPod, address indexed podOwner)",
    onlyArgs: true,
    fromBlock: 17445564,
  })
  const pods = podLogs.map(log => log.eigenPod)
  const restakedStatus = await api.multiCall({ abi: 'bool:hasRestaked', calls: pods })
  restakedStatus.filter(i => i).forEach(() => api.add(nullAddress, 32 * 1e18))
  */

  api.add(nullAddress, await getEigenPods(timestamp) * 1e18)
  const logs = await getLogs({
    api,
    target: '0x858646372CC42E1A627fcE94aa7A7033e7CF075A',
    topic: 'StrategyAddedToDepositWhitelist(address)',
    eventAbi: "event StrategyAddedToDepositWhitelist(address strategy)",
    onlyArgs: true,
    fromBlock: 17445564,
  })
  const strategies = logs.map(log => log.strategy)
  const tokens = await api.multiCall({ abi: 'address:underlyingToken', calls: strategies })
  return sumTokens2({ api, tokensAndOwners2: [tokens, strategies] })
}

// https://github.com/Layr-Labs/eigenlayer-contracts/blob/master/script/output/M1_deployment_mainnet_2023_6_9.json
module.exports = {
  ethereum: {
    tvl,
  },
}