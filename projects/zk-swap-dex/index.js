const { graphQuery } = require("../helper/http");
const { sumTokens2 } = require('../helper/unwrapLPs')

const poolQuery = `
    query pools($lastId: String) {
      pools(first: 1000, where: {id_gt: $lastId} ) {
        id
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }`;

async function fetchPools() {
  const url = 'https://subgraph-mainnet.zk-swap.xyz/subgraphs/name/zkswap/zkswap-mainnet';

  let length
  let lastId = ''
  let toa = [];
  do {
    const {pools} = await graphQuery(url, poolQuery, { lastId })
    pools.forEach(({ id, token0, token1}) => {
      toa.push([token0.id, id])
      toa.push([token1.id, id])
    })
    lastId = pools[pools.length - 1].id
    length = pools.length
  } while (length === 1000)

  return toa;
}

function getTVL(chain) {
  return async (_, block, chainBlocks) => {
    block = chainBlocks[chain];
    const pools = await fetchPools();
    return sumTokens2({ chain, block, tokensAndOwners: pools })
  }
}

module.exports = {
  era: {
    tvl: getTVL('era')
  }
};
