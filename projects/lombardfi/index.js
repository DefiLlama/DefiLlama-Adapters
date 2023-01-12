const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const data = {}

async function getPoolsParameters(api) {
  let key = '' + (api.block ?? 'latest') + api.chain
  if (!data[key]) data[key] = _getPoolsParameters(api)
  return data[key]
}

async function _getPoolsParameters(api) {
  const { factory, fromBlock, } = config[api.chain]
  let logs = await getLogs({
    api,
    target: factory,
    topic: abi.poolCreated,
    fromBlock,
    eventAbi: abi.poolCreated,
  })
  logs = logs.map(i => i.args)
  const pools = await api.multiCall({  abi: abi.pidToPoolAddress, calls: logs.map(i => i._pid) }) 
  const borrowed = await api.multiCall({  abi: abi.borrowed, calls: pools }) 
  pools.forEach((pool, i) => {
    logs[i].pool = pool
    logs[i].borrowed = borrowed
  })
  return logs
}

const config = {
  ethereum: { factory: '0xC2e0398232440Ce90C40acA123433Ca6c9a025B8', fromBlock: 16168459, }
}

module.exports = {
};

Object.keys(config).forEach(chain => {
  const { } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const data = await getPoolsParameters(api)
      const toa = []
      data.forEach(({ pool, _lentAsset, _collateralAssets}) => {
        _collateralAssets.forEach(token => toa.push([token, pool]))
        toa.push([_lentAsset, pool])
      })
      return sumTokens2({ api, tokensAndOwners: toa})
    },
    borrowed: async (_, _b, _cb, { api, }) => {
      const balances = {}
      const data = await getPoolsParameters(api)
      data.forEach(i => sdk.util.sumSingleBalance(balances,i._lentAsset,i.borrowed, chain))
      return balances
    },
  }
})