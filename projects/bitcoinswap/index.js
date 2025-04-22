const ADDRESSES = require('../helper/coreAssets.json')

let abi = require('./abi')
const { sumTokens2, } = require('../helper/unwrapLPs')

const nullAddress = ADDRESSES.null
const poolHelpers = {
  'ethereum': '0x2BDE204066a8994357Fe84BFa2a92DA013bfAbdb',
} 

const tvl = async (api) => {
  const chain = api.chain
  const toa = [] 
  const chunkSize = 10

  const manager = poolHelpers[chain]
  let i = 1
  let foundLastPool = false
  const poolMetaData = []
  do {
    const calls = []
    for (let j = i; j < i + chunkSize; j++)
      calls.push(j)
    i += chunkSize
    const poolMetas = await api.multiCall({
      target: manager,
      abi: abi.poolMetas,
      calls,
    })
    for (const output of poolMetas) {
      if (output.tokenX === nullAddress && output.fee === '0') {
        foundLastPool = true
        break;
      }
      poolMetaData.push(output)
    }
  } while (!foundLastPool)

  const poolCalls = poolMetaData.map(i => ({ params: [i.tokenX, i.tokenY, i.fee] }))
  const pools = await api.multiCall({
    target: manager,
    abi: abi.pool,
    calls: poolCalls,
  })

  pools.forEach((output, i) => toa.push([poolMetaData[i].tokenX, output], [poolMetaData[i].tokenY, output],))

  return sumTokens2({ tokensAndOwners: toa, api, permitFailure: true})
}

Object.keys(poolHelpers).forEach(chain => {
  module.exports[chain] = { tvl }
})