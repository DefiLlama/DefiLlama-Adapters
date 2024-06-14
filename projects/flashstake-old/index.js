const { getLogs } = require('../helper/cache/getLogs')

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: '0xb0aeae6e204bd95911ead25263d7078954fb7fb0',
    topics: ['0x4f2ce4e40f623ca765fc0167a25cb7842ceaafb8d82d3dec26ca0d0e0d2d4896'],
    eventAbi: 'event PoolCreated (address pool, address token)',
    onlyArgs: true,
    fromBlock: 12030855,
  })
  return api.sumTokens({ tokensAndOwners: logs.map(log => [log.token, log.pool]) })
}

module.exports = {
  ethereum: {
    tvl,
  },
};