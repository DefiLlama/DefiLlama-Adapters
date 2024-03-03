const ADDRESSES = require('../helper/coreAssets.json')

let abi = require('./abi')
const { sumTokens2, } = require('../helper/unwrapLPs')

const nullAddress = ADDRESSES.null
const poolHelpers = {
  'blast': ['0x5e7902aDf0Ea0ff827683Cc1d431F740CAD0731b'],
} //liquidityManager contracts

const blacklistedTokens = []

const tvl = async (_, _1, _2, { api }) => {
  const chain = api.chain
  const toa = [] 
  const chunkSize = 10
  const bTokens = [...blacklistedTokens]
  const allPools = []
  const allPoolMetas = []

  for(const manager of poolHelpers[chain]) {
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

    allPools.push(...pools)
    allPoolMetas.push(...poolMetaData)
  }

  allPools.forEach((output, i) => toa.push([allPoolMetas[i].tokenX, output], [allPoolMetas[i].tokenY, output],))
  // if (chain === 'era') bTokens.push(ADDRESSES.arbitrum.WETH)
  return sumTokens2({ tokensAndOwners: toa, api, blacklistedTokens: bTokens, permitFailure: true})
}

Object.keys(poolHelpers).forEach(chain => {
  module.exports[chain] = { tvl }
})