const { getLogs } = require('../helper/cache/getLogs')

async function tvl(_, _b, _cb, { api, }) {
  const logs = await getLogs({
    api,
    target: config[api.chain].factory,
    eventAbi: 'event PoolCreated (address indexed pool)',
    onlyArgs: true,
    fromBlock: config[api.chain].fromBlock,
  })

  const pools = logs.map(i => i.pool)
  const poolIds = await api.multiCall({ abi: 'function getPoolId() view returns (bytes32)', calls: pools })
  const vaults = await api.multiCall({ abi: 'address:getVault', calls: pools })

  const data = await api.multiCall({
    abi: 'function getPoolTokens(bytes32 poolId) view returns (address[] tokens, uint256[] balances, uint256 lastChangeBlock)',
    calls: poolIds.map((v, i) => ({ target: vaults[i], params: v })),
  })

  data.forEach(i => api.addTokens(i.tokens, i.balances))
}

module.exports = {
  methodology: 'sum of all the tokens locked in CLPs',
}

const config = {
  polygon: { factory: '0x5d8545a7330245150bE0Ce88F8afB0EDc41dFc34', fromBlock: 31556084 },
  optimism: { factory: '0x9b683cA24B0e013512E2566b68704dBe9677413c', fromBlock: 97253023 },
  ethereum: { factory: '0x412a5B2e7a678471985542757A6855847D4931D5', fromBlock: 17672894 },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})