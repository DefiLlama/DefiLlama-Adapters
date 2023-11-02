const { graphQuery } = require("../helper/http");
const { sumTokens2 } = require('../helper/unwrapLPs')

const chains = {
  ethereum: {
    graphId: "mainnet",
  },
  arbitrum: {
    graphId: "arbitrum-one",
  },
  polygon: {
    graphId: "matic",
  },
  avax: {
    graphId: "avalanche",
  },
  bsc: {
    graphId: "bsc",
  },
  fantom: {
    graphId: "fantom",
  },
  cronos: {
    graphId: "cronos",
  },
  optimism: {
    graphId: "optimism",
  },
  linea: {
    graphId: 'linea'
  },
  base: {
    graphId: 'base'
  },
  scroll: {
    graphId: 'scroll'
  }
};

async function fetchPools(chain) {
  let url

  switch (chain) {
    case "linea": url = 'https://graph-query.linea.build/subgraphs/name/kybernetwork/kyberswap-elastic-linea'; break;
    case "cronos": url = 'https://cronos-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-cronos'; break;
    case "base": url = 'https://base-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-base'; break;
    case "scroll": url = 'https://scroll-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-scroll'; break;
    default: url = `https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-elastic-${chain}`;
  }
  let length
  let lastId = ''
  let toa = [];
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
  do {
    const {pools} = await graphQuery(url, poolQuery, { lastId })
    pools.forEach(({ id, token0, token1}) => {
      toa.push([token0.id, id])
      toa.push([token1.id, id])
    })
    lastId = pools[pools.length - 1].id
  } while (length === 1000)
  
  return toa;
}

function elastic(chain) {
  return async (_, block, chainBlocks) => {
    if (!("graphId" in chains[chain])) return {};

    block = chainBlocks[chain];
    const pools = await fetchPools(chains[chain].graphId);
    return sumTokens2({ chain, block, tokensAndOwners: pools })
  }
}

module.exports = {
  timetravel: false,
  hallmarks: [
    [Math.floor(new Date('2023-04-17')/1e3), 'Kyber team identified a vuln'],
  ],
};
Object.keys(chains).forEach(chain => {
  module.exports[chain] = {
    tvl: elastic(chain)
  };
});
