const { graphFetchById, } = require('../helper/http')
const { whitelistedNFTs, ART_BLOCKS, sumArtBlocks } = require('../helper/nft')
const sdk = require('@defillama/sdk')

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
  misrepresentedTokens: true,
  hallmarks: [
    [Math.floor(new Date('2022-12-06') / 1e3), 'TVL includes whitelisted nft value as well'],
  ],
  ethereum: {
    tvl: async (timestamp, block, chainBlocks, { api }) => {
      const data = await graphFetchById({
        endpoint: 'https://api.thegraph.com/subgraphs/name/zeframlou/sudoswap',
        query,
        options: {
          timestamp, chain: 'ethereum', chainBlocks, useBlock: true,
        }
      })
      const whitelisted = new Set(whitelistedNFTs.ethereum)
      const balances = {}
      const artBlockOwners = []
      data.forEach(({ ethBalance, collection, numNfts, id }) => {
        sdk.util.sumSingleBalance(balances, 'ethereum', ethBalance / 1e18)
        const nft = collection.id.toLowerCase()
        if (nft === ART_BLOCKS) {
          if (+numNfts > 0)
            artBlockOwners.push(id)
          return;
        }
        if (+numNfts > 0 && whitelisted.has(nft))
          sdk.util.sumSingleBalance(balances, nft, numNfts)
      })

      return sumArtBlocks({ api, owners: artBlockOwners, balances, })
    }
  }
}
