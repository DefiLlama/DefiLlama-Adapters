const { graphFetchById, } = require('../helper/http')
const { getNFTPrices, } = require('../helper/nft')

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
    [Math.floor(new Date('2022-12-06')/1e3), 'TVL includes whitelisted nft value as well'],
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
      const prices = await getNFTPrices({ block, })

      let total = 0
      data.forEach(({ ethBalance, collection, numNfts}) => {
        total += ethBalance/1e18
        const price = prices[collection.id.toLowerCase()]
        if (+numNfts > 0 && price)
          total += numNfts * price/1e18
      })

      return {
        ethereum: total
      }
    }
  }
}
