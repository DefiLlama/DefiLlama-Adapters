const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')
const { startAlliumQuery, retrieveAlliumResults } = require('../helper/allium')
const { getCache, setCache, } = require('../helper/cache')

async function getEigenPods(timestamp) {
  const queryId = await getCache('eigenlayer', 'eigenpods-query')
  const offset = 3;
  const newQuery = await startAlliumQuery(`
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
      status in ('active_ongoing', 'pending_queued', 'pending_initialized', 'withdrawal_possible')
  and slot_timestamp = '${new Date(timestamp * 1e3 - offset * 24 * 3600e3).toISOString().split('T')[0]}T23:59:59'
  ) beacon where pods.params['eigenPod'] = beacon.WITHDRAWAL_ADDRESS`)
  await setCache('eigenlayer', 'eigenpods-query', newQuery)
  const eigenPods = await retrieveAlliumResults(queryId)
  const sum = eigenPods[0]?.["sum"]
  if (!sum) {
    throw new Error("Empty eigenpods")
  }
  return sum
}

async function tvl({timestamp}, _b, _cb, { api, }) {
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
  timetravel: false,
  ethereum: {
    tvl,
  },
}
