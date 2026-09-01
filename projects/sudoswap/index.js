const { getLogs } = require('../helper/cache/getLogs')
const { getCache, setCache } = require('../helper/cache')
const { nullAddress, } = require('../helper/unwrapLPs')

// the subgraph (5ZEPsiros7UhV5noPBHHkzy1rfSBFRP2d2ghHZHHCugd) has no allocations anymore, so we compute TVL from onchain data
module.exports = {
  methodology: 'Sum up all the ETH & nfts in pools',
  ethereum: {
    tvl: async (api) => {
      const PairFactory = '0xb16c1342E617A5B6E4b631EB114483FDB289c0A4'
      const logs = await getLogs({
        api,
        target: PairFactory,
        topics: ['0xf5bdc103c3e68a20d5f97d2d46792d3fdddfa4efeb6761f8141e6a7b936ca66c'],
        eventAbi: 'event NewPair(address pool)',
        onlyArgs: true,
        fromBlock: 14645816,
      })
      const pools = logs.map(i => i.pool)
      const cache = await getCache('sudoswap-v1', api.chain)
      if (!cache.nfts) cache.nfts = []
      const missingPools = pools.slice(cache.nfts.length)
      const missingNfts = await api.multiCall({ abi: 'address:nft', calls: missingPools })
      cache.nfts.push(...missingNfts)

      if (missingPools.length > 0) await setCache('sudoswap-v1', api.chain, cache)
      await api.sumTokens({ owners: pools, tokens: [nullAddress], permitFailure: true, sumChunkSize: 100, })
      return api.sumTokens({ tokensAndOwners2: [cache.nfts, pools], blacklistedTokens: ['0x08142348e6bbf233002b81047bc2f27026af10a5'], permitFailure: true, sumChunkSize: 100, })
    }
  }
}
