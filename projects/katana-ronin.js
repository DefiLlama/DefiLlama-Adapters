const sdk = require('@defillama/sdk');
const { request, gql } = require("graphql-request");
const { sumMultiBalanceOf } = require('@defillama/sdk/build/generalUtil');
const { getBlock } = require('./helper/getBlock');

// Ronin -> Mainnet lookup table
const token_lookup_table = { // needed to add 0x in front
  '0xc99a6a985ed2cac1ef41640596c5a5f9f4e19ef5': '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // weth 
  '0x97a9107c1793bc407d6f527b77e7fff4d812bece': '0xbb0e17ef65f82ab018d8edd776e8dd940327b28b', // axs
  '0xa8754b9fa15fc18bb59458815510e40a12cd2014': '0xcc8fa225d80b9c7d42f96e9570156c65d6caaa25', // slp
  '0x0b7007c13325c48911f73a2dad5fa5dcbf808adc': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // usdc
}
// Don't count staking twice
// const axs_weth_LP_staking = '487671acdea3745b6dac3ae8d1757b44a04bfe8a' 
// const slp_weth_LP_staking = 'd4640c26c1a31cd632d8ae1a96fe5ac135d1eb52'

// Get pairs using the graph 
const graphUrl = 'https://thegraph.roninchain.com/subgraphs/name/axieinfinity/katana-subgraph'

const pairsQuery = gql`
query pairs($block: Int, $skip: Int!) {
  pairs(
    block: { number: $block } # TODO: cjeck block fecthing works
    first: 500, 
    skip: $skip, 
    orderBy: trackedReserveETH, 
    orderDirection: desc
  ) {
    id
    token0 {
      id
      symbol
      name
    }
    token1 {
      id
      symbol
      name
    }
    __typename
    }
}
`

const tokensQuery = gql`
query tokens {
  tokens(first: 500) {
    id
    name
    symbol
    totalLiquidity
  }
}
`
async function tvl(timestamp, ethBlock, chainBlocks) {
  const block = await getBlock(timestamp, "ronin", chainBlocks)

  const {pairs} = await request(
    graphUrl,
    pairsQuery,
    {block, skip: 0}
  )

  const calls = pairs.map(pair => [{
    target: pair.token0.id,
    params: pair.id
  }, {
    target: pair.token1.id,
    params: pair.id 
  }]).flat()
  const LP_balances = (
    await sdk.api.abi.multiCall({
      calls: calls,
      abi: 'erc20:balanceOf',
      block: block,
      chain: 'ronin'
    })
  )

  // const transform = addr => tokens.find(t => t.id == addr).symbol
  const transform = addr => token_lookup_table[addr.toLowerCase()]

  const balances = {};
  sdk.util.sumMultiBalanceOf(balances, LP_balances, true, transform);
  // console.log('balances', balances)
  if (balances[undefined]) {
    throw('One balance is undefined, probably because the ronin-to-mainnet mapping is not defined for some tokens')
  }
  return balances
}

/*
// Could also return USDT equivalent of LPs because uses the same graph as uni
const {getChainTvl} = require('./helper/getUniSubgraphTvl')
const tvl2 = (timestamp, block, chainBlocks) => getChainTvl({
  ronin: graphUrl
}, 'katanaFactories')('ronin')(timestamp, block, chainBlocks)
*/

module.exports = {
  methodology: `Counts the tokens locked on LPs pools, pulling the pairs data from the katana graphql endpoint`,
  ronin: {tvl: tvl}
}
