const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

async function tvl(api) {
  const { fromBlock, basicFactorys, stableFactorys, rhythmFactorys = [] } = config[api.chain]

  let logs = await Promise.all([basicFactorys, stableFactorys, rhythmFactorys].flat().map(getFactoryLogs))
  logs = logs.flat()

  const ownerTokens = logs.map(({ token0, token1, pool }) => [[token0, token1], pool])
  return sumTokens2({ api, ownerTokens})

  async function getFactoryLogs(target) {
    return getLogs2({
      api,
      target,
      fromBlock,
      eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, address pool)',
    })
  }
}

const config = {
  taiko: {
    fromBlock: 787,
    stableFactorys: ['0x3e846B1520E74728EFf445F1f86D348755F738d9'],
    basicFactorys: ['0xDFFee0ad5C833f2A5E610dfe9FD1aD82743eA74e'],
    rhythmFactorys: ['0x0A78CAB89a069555a18B78537f09fab24c03dECd']
  }
}

Object.keys(config).forEach(chain => { module.exports[chain] = { tvl } })