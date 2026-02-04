const sdk = require("@defillama/sdk");
const { graphFetchById, } = require('../helper/cache')
const { ART_BLOCKS, sumArtBlocks } = require('../helper/nft')

const query = `
query get_pairs($lastId: String, $block: Int) {
  pairs(
    first: 1000
    block: { number: $block }
    where: {
      and: [
        {id_gt: $lastId}
        {
            or: [
            { numNfts_gt: 0 },
            { ethBalance_gt: 0 },
          ]
        }
      ]
    }
    ) {
    id
    ethBalance
    collection {
      id
    }
    spotPrice
    numNfts
  }
}`

module.exports = {
  methodology: 'Sum up all the ETH in pools and count whitelisted NFT values as well (price fetched from chainlink)',
  ethereum: {
    tvl: async (api) => {
      const data = await graphFetchById({
        endpoint: sdk.graph.modifyEndpoint('5ZEPsiros7UhV5noPBHHkzy1rfSBFRP2d2ghHZHHCugd'),
        query,
        api,
        options: {
          useBlock: true,
          safeBlockLimit: 500,
        }
      })
      const balances = {}
      const artBlockOwners = []
      data.forEach(({ ethBalance, collection, numNfts, id }) => {
        sdk.util.sumSingleBalance(balances, 'ethereum', ethBalance / 1e18)
        const nft = collection.id.toLowerCase()

        if (+numNfts > 0) {
          if (nft === ART_BLOCKS) {
            artBlockOwners.push(id)
            return;
          }
          sdk.util.sumSingleBalance(balances, nft, numNfts)
        }
      })

      return sumArtBlocks({ api, owners: artBlockOwners, balances, })
    }
  }
}

/* 
const { getLogs } = require('../helper/cache/getLogs')
const { getCache, setCache } = require('../helper/cache')
const { nullAddress, } = require('../helper/unwrapLPs')

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
      if (!cache.pools) cache.nfts = []
      const missingPools = pools.slice(cache.nfts.length)
      const missingNfts = await api.multiCall({  abi: 'address:nft', calls: missingPools})
      cache.nfts.push(...missingNfts)

      if (missingPools.length > 0) await setCache('sudoswap-v1', api.chain, cache)
      await api.sumTokens({ owners: pools, tokens: [nullAddress]})
      return api.sumTokens({ tokensAndOwners2: [cache.nfts, pools], blacklistedTokens: ['0x08142348e6bbf233002b81047bc2f27026af10a5']})
    }
  }
}
*/