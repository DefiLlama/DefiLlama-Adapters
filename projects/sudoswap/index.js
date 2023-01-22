const { graphFetchById, } = require('../helper/http')
const { getWhitelistedNFTs, } = require('../helper/tokenMapping')
const sdk = require('@defillama/sdk')

const query = `
query get_pairs($lastId: String, $block: Int) {
  pairs(
    first: 1000
    block: { number: $block }
    where: {id_gt: $lastId}
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
    tvl: async (timestamp, block, chainBlocks) => {
      const data = await graphFetchById({
        endpoint: 'https://api.thegraph.com/subgraphs/name/zeframlou/sudoswap',
        query,
        options: {
          timestamp, chain: 'ethereum', chainBlocks, useBlock: true,
        }
      })
      const whitelisted = new Set(getWhitelistedNFTs())
      const balances = {}
      data.forEach(({ ethBalance, collection, numNfts }) => {
        sdk.util.sumSingleBalance(balances, 'ethereum', ethBalance / 1e18)
        if (+numNfts > 0 && whitelisted.has(collection.id.toLowerCase()))
          sdk.util.sumSingleBalance(balances, collection.id.toLowerCase(), numNfts)
      })

      return balances
    }
  }
}
