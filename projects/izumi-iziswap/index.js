
let bscPools = require('../izumi/bscPools.json')
let abi = require('../izumi/abi')
const { sumTokens2, } = require('../helper/unwrapLPs')

const sdk = require('@defillama/sdk')

module.exports = {
  bsc: {
    tvl: async (ts, _b, { bsc: block }) => {
      const chain = 'bsc'
      const toa = []
      // const block = await getBlock(ts, chain, chainBlocks, false)

      // const logs = (await sdk.api.util
      //   .getLogs({
      //     keys: [],
      //     toBlock: block,
      //     chain,
      //     target: '0xd7de110bd452aab96608ac3750c3730a17993de0',
      //     fromBlock: 17681022,
      //     topic: 'NewPool(address,address,uint24,uint24,address)',
      //   })).output;
      // bscPools = logs.map(log => `0x${log.data.substr(-40)}`.toLowerCase())

      const calls = bscPools.map(i => ({ target: i }))
      const { output: tokenY } = await sdk.api.abi.multiCall({
        abi: abi.tokenY,
        calls,
        chain, block,
      })
      const { output: tokenX } = await sdk.api.abi.multiCall({
        abi: abi.tokenX,
        calls,
        chain, block,
      })

      tokenX.map(({ output, }, i) => toa.push([output, bscPools[i]]))
      tokenY.map(({ output, }, i) => toa.push([output, bscPools[i]]))
      return sumTokens2({ tokensAndOwners: toa, chain, block })
    }
  },
  ownTokens: ['IZI', 'IUSD'],
}
