
let abi = require('./abi')
const { sumTokens2, } = require('../helper/unwrapLPs')

const sdk = require('@defillama/sdk')
const nullAddress = '0x0000000000000000000000000000000000000000'
const poolHelper = '0x93C22Fbeff4448F2fb6e432579b0638838Ff9581'

module.exports = {
  bsc: {
    tvl: async (ts, _b, { bsc: block }) => {
      const chain = 'bsc'
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
          target: poolHelper,
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
        target: poolHelper,
        abi: abi.pool,
        calls: poolCalls,
        chain, block,
      })

      pools.forEach(({ output }, i) => toa.push([poolMetaData[i].tokenX, output], [poolMetaData[i].tokenY, output],))

      return sumTokens2({ tokensAndOwners: toa, chain, block })
    }
  },
  ownTokens: ['IZI', 'IUSD'],
}
