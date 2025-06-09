const sdk = require("@defillama/sdk")
const { cachedGraphQuery } = require("../helper/cache");
const { sumTokens2 } = require('../helper/unwrapLPs')

const CONFIG = {
  ethereum: { graphId: "mainnet" },
  arbitrum: { graphId: "arbitrum-one", blacklistedTokens: ['0x0df5dfd95966753f01cb80e76dc20ea958238c46'] }, // rWETH
  polygon: { graphId: "matic" },
  avax: { graphId: "avalanche" },
  bsc: { graphId: "bsc" },
  fantom: { graphId: "fantom" },
  cronos: { graphId: "cronos" },
  optimism: { graphId: "optimism" },
  linea: { graphId: 'linea' },
  base: { graphId: 'base' },
  scroll: { graphId: 'scroll' }
};

async function fetchPools(chain) {
  let url

  switch (chain) {
    case "linea": url = 'https://graph-query.linea.build/subgraphs/name/kybernetwork/kyberswap-elastic-linea'; break;
    case "cronos": url = 'https://cronos-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-cronos'; break;
    case "base": url = 'https://base-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-base'; break;
    case "scroll": url = 'https://scroll-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-scroll'; break;
    case "mainnet": url = sdk.graph.modifyEndpoint('4U9PxDR4asVvfXyoVy18fhuj6NHnQhLzZkjZ5Bmuc5xk'); break;
    case "arbitrum-one" : url = sdk.graph.modifyEndpoint('C36tj8jSpEHxcNbjM3z7ayUZHVjrk4HRqnpGMFuRgXs6'); break;
    case "avalanche": url = sdk.graph.modifyEndpoint('9oMJfc7CL8uDqqQ3T3NFBnFCz9JMwq2YhH9AqojECFWp'); break;
    case "bsc": url = sdk.graph.modifyEndpoint('FDEDgycFnTbPZ7PfrnWEZ4iR7T5De6BR69zx1i8gKQRa'); break;
    case "fantom": url = sdk.graph.modifyEndpoint('9aj6YZFVL647wFBQXnNKM72eiowP4fyzynQKwLrn5axL'); break;
    case "optimism": url = sdk.graph.modifyEndpoint('3Kpd8i7U94pTz3Mgdb8hyvT5o26fpwT7SUHAbTa6JzfZ'); break;
    default: url = `https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-elastic-${chain}`;
  }
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
    const pools = await cachedGraphQuery('kyber/'+chain, url, poolQuery, { fetchById: true,  })
    pools.forEach(({ id, token0, token1}) => {
      toa.push([token0.id, id])
      toa.push([token1.id, id])
    })
  
  return toa;
}

function elastic(graphId, blacklistedTokens = []) {
  return async (api) => {
    if (!graphId) return
    const pools = await fetchPools(graphId);
    return sumTokens2({ api, tokensAndOwners: pools, blacklistedTokens })
  }
}

module.exports = {
  timetravel: false,
  hallmarks: [
    ['2023-04-17', 'Kyber team identified a vuln'],
    [1700611200,'Protocol exploit'],
  ],
};

Object.keys(CONFIG).forEach((chain) => {
  const { graphId, blacklistedTokens } = CONFIG[chain]
  module.exports[chain] = { tvl: elastic(graphId, blacklistedTokens)}
})

module.exports.base.tvl = () => ({})  // setting base to 0 for now as I could not find the graph endpoint