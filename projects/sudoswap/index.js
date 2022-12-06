const { graphFetchById, } = require('../helper/http')

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
  methodology: 'Sum up all the ETH in pools',
  ethereum: {
    tvl: async (timestamp, block, chainBlocks) => {
      const data = await graphFetchById({
        endpoint: 'https://api.thegraph.com/subgraphs/name/zeframlou/sudoswap',
        query,
        options: {
          timestamp, chain: 'ethereum', chainBlocks, useBlock: true,
        }
      })

      let pureEthBalance = 0
      data.forEach(({ ethBalance, }) => {
        pureEthBalance += ethBalance/1e18
      })

      return {
        ethereum: pureEthBalance
      }
    }
  }
}
