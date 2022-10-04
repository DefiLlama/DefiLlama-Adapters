const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { GraphQLClient, gql } = require('graphql-request')
const { transformArbitrumAddress } = require("../helper/portedTokens");

const wrappedAssetHandlers = {
  // yvUSDC
  '0xa354f35829ae975e850e23e9615b11da1b3dc4de': async (amount, block) => {
    const pricePerShare = await sdk.api.abi.call({
      target: '0xa354f35829ae975e850e23e9615b11da1b3dc4de',
      abi: abi.pricePerShare,
      block,
    })

    const usdcAmount = amount / (pricePerShare.output / 1e6)
    return { amount: usdcAmount, asset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' }
  },
}

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
    if (wrappedAssetHandlers[assetAddress]) {
      ({ amount, asset: assetAddress } = await wrappedAssetHandlers[assetAddress](amount, block))
    }
    const transformedAddr = await transformAddress(assetAddress)
    output[transformedAddr] = (output[transformedAddr] || 0) + amount
  }

  for (const pool of data.pools) {
    if (!pool.fyToken.underlyingAsset) {
      continue
    }

    let amount = pool.fyTokenReserves * pool.currentFYTokenPriceInBase * (10 ** pool.fyToken.underlyingAsset.decimals)
    let assetAddress = pool.fyToken.underlyingAddress

    if (wrappedAssetHandlers[assetAddress]) {
      ({ amount, asset: assetAddress } = await wrappedAssetHandlers[assetAddress](amount, block))
    }

    const transformedAddr = await transformAddress(assetAddress)
    output[transformedAddr] = (output[transformedAddr] || 0) + amount
  }

  return output
}

const ethTvl = async (timestamp, ethBlock) => {
  return getTVL('yieldprotocol/v2-mainnet', ethBlock)
};

const arbTvl = async (timestamp, ethBlock, chainBlocks) => {
  return getTVL('yieldprotocol/v2-arbitrum', chainBlocks['arbitrum'], (await transformArbitrumAddress()))
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
