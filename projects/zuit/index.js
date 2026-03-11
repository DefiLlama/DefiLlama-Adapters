const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

async function tvl(api) {
  const { fromBlock, baseFactorys, stableFactorys, oasisFactorys = [] } = config[api.chain]

  let logs = await Promise.all([baseFactorys, stableFactorys, oasisFactorys].flat().map(getFactoryLogs))
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
  zircuit: {
    fromBlock: 1374699,
    baseFactorys: ['0xE4CF807E351b56720B17A59094179e7Ed9dD3727'],
    stableFactorys: ['0x40d660504eB163708d8AC8109fc8F2c063ddAE4b'],
    oasisFactorys: ['0xE14f6575F4721F404FFB79DA76e4790AD67B960A']
  }
}

Object.keys(config).forEach(chain => { module.exports[chain] = { tvl } })