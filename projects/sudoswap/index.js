const sdk = require('@defillama/sdk')
const { nullAddress, sumTokens2 } = require('../helper/unwrapLPs')

module.exports = {
  methodology: 'Sum up all the ETH in pools',
  ethereum: {
    tvl: async (_, block) => {
      const chain = 'ethereum'
      const PairFactory = '0xb16c1342E617A5B6E4b631EB114483FDB289c0A4'
      const logs = await sdk.api.util.getLogs({
        keys: [],
        toBlock: block,
        target: PairFactory,
        fromBlock: 14650107,
        topic: 'NewPair(address)',
      })
      const owners = logs.output.map(i => `0x${i.data.substring(26, 66)}`)
      return sumTokens2({ tokens: [nullAddress], owners, chain, block })
    }
  }
}
