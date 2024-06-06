const ADDRESSES = require('../helper/coreAssets.json')

let abi = require('./abi')
const { sumTokens2, } = require('../helper/unwrapLPs')

const sdk = require('@defillama/sdk')
const nullAddress = ADDRESSES.null
const poolHelper = '0xE78e7447223aaED59301b44513D1d3A892ECF212'

module.exports = {
  aurora: {
    tvl: async (ts, _b, { aurora: block }) => {
      const chain = 'aurora'
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
  // ownTokens: ['ARC'],
}
