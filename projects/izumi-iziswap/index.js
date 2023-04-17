
let abi = require('./abi')
const { sumTokens2, } = require('../helper/unwrapLPs')

const sdk = require('@defillama/sdk')
const nullAddress = '0x0000000000000000000000000000000000000000'
const poolHelpers = {
  'bsc': '0x93C22Fbeff4448F2fb6e432579b0638838Ff9581',
  'arbitrum': '0x611575eE1fbd4F7915D0eABCC518eD396fF78F0c',
  'era': '0x936c9A1B8f88BFDbd5066ad08e5d773BC82EB15F',
}

const getTvl = async (chain, block) => {
  const toa = []
  let i = 1
  let foundLastPool = false
  const chunkSize = 10
  const poolMetaData = []

  do {
    const calls = []
    for (let j = i; j < i + chunkSize; j++)
      calls.push({ params: j })
    i += chunkSize
    const { output: poolMetas } = await sdk.api.abi.multiCall({
      target: poolHelpers[chain],
      abi: abi.poolMetas,
      calls,
      chain, block,
    })
    for (const { output } of poolMetas) {
      if (output.tokenX === nullAddress && output.fee === '0') {
        foundLastPool = true
        break;
      }
      poolMetaData.push(output)
    }
  } while (!foundLastPool)

  const poolCalls = poolMetaData.map(i => ({ params: [i.tokenX, i.tokenY, i.fee] }))
  const { output: pools } = await sdk.api.abi.multiCall({
    target: poolHelpers[chain],
    abi: abi.pool,
    calls: poolCalls,
    chain, block,
  })
  pools.forEach(({ output }, i) => toa.push([poolMetaData[i].tokenX, output], [poolMetaData[i].tokenY, output],))

  return sumTokens2({ tokensAndOwners: toa, chain, block })
}

module.exports = {
  bsc: {
    tvl: async (ts, _b, { bsc: block }) => {
      const chain = 'bsc'
      return getTvl(chain, block)
    }
  },
  arbitrum: {
    tvl: async (ts, _b, { arbitrum: block }) => {
      const chain = 'arbitrum'
      return getTvl(chain, block)
    }
  },
  era: {
    tvl: async (ts, _b, { era: block }) => {
      const chain = 'era'
      return getTvl(chain, block)
    }
  }
  // ownTokens: ['IZI', 'IUSD'],
}
