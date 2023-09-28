const sdk = require('@defillama/sdk')
const { request, gql } = require("graphql-request")
const { sumTokens2 } = require('../helper/unwrapLPs')

async function fetchPoolsInfo() {
  const subgraphUrl = 'https://api.thegraph.com/subgraphs/name/gammaswap/gammaswap-v1-arbitrum'
  const query = gql`
    query {
      gammaPools {
        address
        cfmm
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }
  `
  const { gammaPools } = await request(subgraphUrl, query);

  return gammaPools.map(pool => ({
    address: pool.address,
    cfmm: pool.cfmm,
    token0: pool.token0.id,
    token1: pool.token1.id,
  }))
}

async function tvl(timestamp, block, _, { api }) {
  const pools = await fetchPoolsInfo();
  const poolAddresses = pools.map(pool => pool.address);
  const tokenAddresses = Array.from(new Set(pools.map(pool => [pool.token0, pool.token1]).flat()));
  const lpTokens = pools.map(pool => pool.cfmm);

  return sumTokens2({ api, owners: poolAddresses, tokens: [...tokenAddresses, ...lpTokens], resolveLP: true });
}

module.exports = {
  arbitrum: {
    tvl,
  }
}
