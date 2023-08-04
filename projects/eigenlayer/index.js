const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

async function tvl(_, _b, _cb, { api, }) {
  const logs = await getLogs({
    api,
    target: '0x858646372CC42E1A627fcE94aa7A7033e7CF075A',
    topic: 'StrategyAddedToDepositWhitelist(address)',
    eventAbi: "event StrategyAddedToDepositWhitelist(address strategy)",
    onlyArgs: true,
    fromBlock: 17445564,
  })
  const podLogs = await getLogs({
    api,
    target: '0x91E677b07F7AF907ec9a428aafA9fc14a0d3A338',
    topics: ['0x21c99d0db02213c32fff5b05cf0a718ab5f858802b91498f80d82270289d856a'],
    eventAbi: "event PodDeployed (address indexed eigenPod, address indexed podOwner)",
    onlyArgs: true,
    fromBlock: 17445564,
  })
  const strategies = logs.map(log => log.strategy)
  const pods = podLogs.map(log => log.eigenPod)
  const restakedStatus = await api.multiCall({ abi: 'bool:hasRestaked', calls: pods })
  restakedStatus.filter(i => i).forEach(() => api.add(nullAddress, 32 * 1e18))
  const tokens = await api.multiCall({ abi: 'address:underlyingToken', calls: strategies })
  return sumTokens2({ api, tokensAndOwners2: [tokens, strategies] })
}

// https://github.com/Layr-Labs/eigenlayer-contracts/blob/master/script/output/M1_deployment_mainnet_2023_6_9.json
module.exports = {
  ethereum: {
    tvl,
  },
}