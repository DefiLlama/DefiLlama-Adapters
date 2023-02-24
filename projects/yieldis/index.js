const { GraphQLClient, gql } = require('graphql-request')
const { transformArbitrumAddress } = require("../helper/portedTokens");
const { getBlock } = require('../helper/http')

const getTVL = async (subgraph, block, transformAddress = a => a) => {
  const endpoint = `https://api.thegraph.com/subgraphs/name/${subgraph}`
  const graphQLClient = new GraphQLClient(endpoint)

  var query = gql`
  query($block: Int!){
    assets(block: { number: $block }) {
      id
      totalCollateral
      totalInPools
      decimals
    }

    pools(block: { number: $block }) {
      fyTokenReserves
      fyToken {
        underlyingAddress
        underlyingAsset {
          decimals
        }
      }
      currentFYTokenPriceInBase
    }
    _meta {
      block {
        number
      }
    }
  }
  `;

  const data = await graphQLClient.request(query, { block });

  const output = {}
  for (const asset of data.assets) {
    let amount = (parseFloat(asset.totalCollateral) + parseFloat(asset.totalInPools)) * (10 ** asset.decimals)
    let assetAddress = asset.id
    const transformedAddr = transformAddress(assetAddress)
    output[transformedAddr] = (output[transformedAddr] || 0) + amount
  }

  for (const pool of data.pools) {
    if (!pool.fyToken.underlyingAsset) {
      continue
    }

    let amount = pool.fyTokenReserves * pool.currentFYTokenPriceInBase * (10 ** pool.fyToken.underlyingAsset.decimals)
    let assetAddress = pool.fyToken.underlyingAddress

    const transformedAddr = transformAddress(assetAddress)
    output[transformedAddr] = (output[transformedAddr] || 0) + amount
  }

  return output
}

const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
  return getTVL('yieldprotocol/v2-mainnet', ethBlock)
};

const arbTvl = async (timestamp, ethBlock, chainBlocks) => {
  const block = await getBlock(timestamp, 'arbitrum', chainBlocks)
  return getTVL('yieldprotocol/v2-arbitrum', block, (await transformArbitrumAddress()))
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  arbitrum: {
    tvl: arbTvl,
  },
  methodology:
    "Counts tvl on the Pools and Joins through PoolFactory and Joinfactory Contracts",
};
