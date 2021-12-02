const BigNumber = require('bignumber.js');
const { request, gql } = require('graphql-request');

const BASE_URL = 'https://api.subquery.network/sq/sora-xor/sora';
const XOR_ASSET_ID = '0x0200000000000000000000000000000000000000000000000000000000000000';
const POOL_XYK_ENTITIES = gql`
query PoolXYKEntities (
  $first: Int = 1)
{
  poolXYKEntities (
    first: $first
  )
  {
    nodes {
      pools {
        edges {
          node {
            targetAssetId,
            priceUSD,
            baseAssetReserves,
            targetAssetReserves
          }
        }
      }
    }
  }
}`;

async function fetch () {
  try {
    const { poolXYKEntities } = await request(BASE_URL, POOL_XYK_ENTITIES, {});
    if (!poolXYKEntities) {
      throw new Error('SORA adapter: Something was happened with SORA requested data!');
    }
    const data = poolXYKEntities.nodes[0].pools.edges.map(item => item.node);
    if (!data || !data.length) {
      throw new Error('SORA adapter: Something was happened with SORA requested data!');
    }
    const xor = data.find(item => item.targetAssetId === XOR_ASSET_ID);
    const xorPriceUSD = new BigNumber(xor.priceUSD);

    const tvl = data.reduce((acc, item) => {
      if (item.targetAssetId === XOR_ASSET_ID) {
        return acc; // XOR-XOR pair
      }
      const priceUSD = new BigNumber(item.priceUSD);
      const baseAssetReserves = new BigNumber(item.baseAssetReserves);
      const targetAssetReserves = new BigNumber(item.targetAssetReserves);
      // x += (xorReserves * xorPrice + targetAssetReserves * targetAssetPriceUSD)
      return acc.plus(baseAssetReserves.times(xorPriceUSD).plus(targetAssetReserves.times(priceUSD)));
    }, new BigNumber(0));

    return tvl.toNumber();
  } catch (error) {
    throw new Error('SORA adapter: Something was happened with SORA subquery connection!');
  }
}

module.exports = {
  methodology: "All pools from https://polkaswap.io launched on SORA network are included in TVL.",
  fetch,
};
