const { request, gql } = require('graphql-request')
const { getBlock } = require('./getBlock')

function getChainVolume({ graphUrls, factoriesName = 'uniswapFactories', field = 'totalVolumeUSD' }) {
  const graphQuery = gql`
query get_tvl($block: Int) {
  ${factoriesName}(
    block: { number: $block }
  ) {
    ${field}
  }
}
`

  return (chain) => {
    return async (timestamp, chainBlocks) => {
      const block = await getBlock(timestamp, chain, chainBlocks)
      console.log(block, 'block')
      const uniswapFactories = (
        await request(graphUrls[chain], graphQuery, {
          block,
        })
      )[factoriesName]
      const usdTvl = Number(uniswapFactories[0][field])

      return usdTvl
    }
  }
}

module.exports = {
  getChainVolume,
}
