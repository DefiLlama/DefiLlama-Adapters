const ADDRESSES = require('../helper/coreAssets.json')
const { graphQuery } = require('../helper/http')


const arbEndpoint = "https://subgraph.satsuma-prod.com/9b84d9926bf3/nabla-finance--3958960/nabla-mainnetAlpha/api";
const baseEndpoint = "https://subgraph.satsuma-prod.com/9b84d9926bf3/nabla-finance--3958960/nabla-mainnetAlpha-base/api";
const query = `{
    backstopPools {
      id
	  reserves
      token {
        id
      }
      coveredSwapPools(orderBy: coveredIndex) {
        id
        reserves
        token {
          id
        }
      }
    }
}`;
const tvlFactory = endpoint => async function tvl(api) {
        const { backstopPools } = await graphQuery(endpoint, query, {}, {api});

        backstopPools.forEach(bp => {
            api.add(bp.token.id, bp.reserves)
            bp.coveredSwapPools.forEach(pool => {
                api.add(pool.token.id, pool.reserves)
            });
        });
    }

module.exports = {
    arbitrum: { tvl: tvlFactory(arbEndpoint) },
    base: { tvl: tvlFactory(baseEndpoint) },
}
