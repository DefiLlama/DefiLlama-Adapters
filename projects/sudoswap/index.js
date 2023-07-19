const { graphFetchById, } = require('../helper/http')
const { ART_BLOCKS, sumArtBlocks } = require('../helper/nft')
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
  ethereum: {
    tvl: async (timestamp, block, chainBlocks, { api }) => {
      const data = await graphFetchById({
        endpoint: 'https://api.thegraph.com/subgraphs/name/zeframlou/sudoswap',
        query,
        api,
        options: {
          useBlock: true,
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
