const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const retry = require("../helper/retry");
const BigNumber = require('bignumber.js');
const { GraphQLClient, gql } = require("graphql-request");
// const { transformBscAddress, transformPolygonAddress, transformMoonriverAddress } = require("../helper/portedTokens");

// https://github.com/oceanprotocol/contracts/blob/main/artifacts/address.json
const contracts = {
  ethereum: {
    graphql_endpoint: "https://subgraph.mainnet.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph",
    OCEAN: '0x967da4048cD07aB37855c090aAF366e4ce1b9F48', 
  },
  polygon: {
    graphql_endpoint: "https://subgraph.polygon.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph",
    OCEAN: '0x282d8efCe846A88B159800bd4130ad77443Fa1A1', 
  }, 
  bsc: {
    graphql_endpoint: "https://subgraph.bsc.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph",
    OCEAN: '0xdce07662ca8ebc241316a15b611c89711414dd1a',
  }, 
  moonriver: {
    graphql_endpoint: "https://subgraph.moonriver.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph",
    OCEAN: '0x99C409E5f62E4bd2AC142f17caFb6810B8F0BAAE',
  }, 
  energyweb: {
    graphql_endpoint: "https://subgraph.energyweb.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph",
    OCEAN: '0x593122aae80a6fc3183b2ac0c4ab3336debee528',
  }, 
}

const PAGE_SIZE = 1000
const graphqlQuery = gql`
query GET_POOLS($skip: Int, $block: Int, $first: Int) {
  poolFactories {
    id
    totalValueLocked
    poolCount
  }
  pools (
  	first: $first
    skip: $skip
    block: { number: $block }
  ) {
    id
  }
}
`

function chainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const {graphql_endpoint, OCEAN} = contracts[chain]
    console.log(graphql_endpoint, OCEAN) 
    let block = chainBlocks[chain] - 50 // go back a few blocks as graph is not always up to date 
    if (chain == 'moonriver') {block = 1242900;}
    const transform = (chain === 'bsc') ? 
        t => contracts.ethereum.OCEAN: 
        t => `${chain}:${t}`;

    const balances = {};

    let skip = 0;
    while (skip >= 0) {
      var graphQLClient = new GraphQLClient(graphql_endpoint);
      const query = (
        await retry(async () => await graphQLClient.request(
          graphqlQuery, {skip, block, first: PAGE_SIZE}
        ))
      );
      let pools = query.pools;
      console.log(chain, 'skip', skip, 'pools.length', pools.length, 'poolFactories.length', query.poolFactories.length, '\n   poolCount', query.poolFactories[0].poolCount, 'tvl', query.poolFactories[0].totalValueLocked);
      
      // Stop criteria for while loop once graphql query returned less than page-size pools
      if (true || pools.length < PAGE_SIZE) {
        skip = -1;
      } else {
        skip += PAGE_SIZE;
      }
      
      // Filter out not-finalized pools 
      const {output: finalizeds} = await sdk.api.abi.multiCall({
        abi: abi['pool_isFinalized'],
        calls: pools.map(pool => ({
          target: pool.id,
        })),
        block,
        chain
      });
      console.log('pools.length before filter isFinalized', pools.length)
      pools = pools.filter((p, i) => finalizeds[i].output)
      console.log('pools.length after filter isFinalized', pools.length)

      // Compute OCEAN balance - to count as TVL, but also filter-out pools with no OCEAN balance
      let collateralBalances = await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        calls: pools.map(pool => ({
          target: OCEAN,
          params: [pool.id]
        })),
        block,
        chain
      });

      // Filter out pools with null OCEAN balance
      const OCEAN_balance_gt_0 = collateralBalances.output.map(b => b.output > 0)
      pools = pools.filter((p, i) => OCEAN_balance_gt_0[i])
      collateralBalances.output = collateralBalances.output.filter((p, i) => OCEAN_balance_gt_0[i])
      console.log('pools.length after filter balancesGt0', pools.length)

      // Get Normalized weights to account for balance of data-tokens
      // At pool creation, the OCEAN collateral is used to mint data-tokens with a iven ratio of OCEAN/dtoken
      // The TVL of the pool, like any AMM, should account for both sides of the liquisity 
      const {output: weights} = await sdk.api.abi.multiCall({
        abi: abi['pool_getNormalizedWeight'],
        calls: pools.map(pool => ({
          target: pool.id,
          params: [OCEAN]
        })),
        block,
        chain
      });

      collateralBalances.output.forEach((v,i) => {
        const w = (new BigNumber(weights[i].output || '0')).div(1e18) 
        collateralBalances.output[i].output = (new BigNumber(v.output).idiv(w)).toString(10)
      })
      sdk.util.sumMultiBalanceOf(balances, collateralBalances, true, transform);
      // sdk.util.sumSingleBalance(balances, 'ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', query.poolFactories[0].totalValueLocked)
      console.log(balances);
    }
    return balances;
  }
}

module.exports = {
  ethereum: {
    tvl: chainTvl('ethereum')
  },
  polygon: {
    tvl: chainTvl('polygon')
  },
  bsc: {
    tvl: chainTvl('bsc')
  }, 
  moonriver: {
    tvl: chainTvl('moonriver')
  },
  'Methodology': 'OCEAN TVL is OCEAN locked as a stake in each pool of data'
}