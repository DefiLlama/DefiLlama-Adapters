const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const retry = require("../helper/retry");
const BigNumber = require('bignumber.js');
const { GraphQLClient, gql } = require("graphql-request");
const { getBlock } = require("../helper/getBlock.js");

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
  poolFactories(
    block: {number: $block}
  ) {
    id
    totalValueLocked
    poolCount
  }
  pools (
  	first: $first
    skip: $skip
    block: {number: $block}
  ) {
    id
  }
}
`

function chainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
    const {graphql_endpoint, OCEAN} = contracts[chain]
    const graphQLClient = new GraphQLClient(graphql_endpoint);

    let block = chainBlocks[chain] // go back a few blocks as graph is not always up to date 
    block = await getBlock(timestamp, chain, chainBlocks);
    // if (chain == 'moonriver') {block = 1242900;} // TODO: get correct moonriver block
    // console.log(chainBlocks[chain])
    const transform = (['bsc', 'moonriver'].includes(chain)) ? 
        t => contracts.ethereum.OCEAN: 
        t => `${chain}:${t}`;

    // Do pagination on the graphql query to return pools by batches of PAGE_SIZE
    let skip = 0;
    while (skip >= 0) {
      const query = (
        await retry(async () => await graphQLClient.request(
          graphqlQuery, {skip, block: block - 200, first: PAGE_SIZE}
        ))
      );
      let pools = query.pools;
      console.log(chain, 'block', block, 'skip', skip, 'poolCount', query.poolFactories[0].poolCount, 'tvl', parseInt(query.poolFactories[0].totalValueLocked));
      
      // Stop criteria for while loop once graphql query returned less than page-size pools
      if (pools.length < PAGE_SIZE) {
        skip = -1;
      } else {
        skip += PAGE_SIZE;
      }
      
      // Filter out not-finalized pools - not totally necessary with subsequent filter on OCEAN balance > 0
      const {output: finalizeds} = await sdk.api.abi.multiCall({
        abi: abi['pool_isFinalized'],
        calls: pools.map(pool => ({
          target: pool.id,
        })),
        block,
        chain
      });
      pools = pools.filter((p, i) => finalizeds[i].output)

      // Compute OCEAN balance - to count as TVL, but also filter-out pools with no OCEAN balance
      const OCEAN_balances = await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        calls: pools.map(pool => ({
          target: OCEAN,
          params: [pool.id]
        })),
        block,
        chain
      });

      // Filter out pools with null OCEAN balance
      const OCEAN_balance_gt_0 = OCEAN_balances.output.map(b => b.output > 0)
      pools = pools.filter((p, i) => OCEAN_balance_gt_0[i])
      OCEAN_balances.output = OCEAN_balances.output.filter((p, i) => OCEAN_balance_gt_0[i])
      // console.log('pools.length before filtering', query.poolFactories[0].poolCount, 'after isFinalized and balancesGt0 filters', pools.length)

      // Get Normalized weights to account for balance of data-tokens
      // At pool creation, the OCEAN collateral is used to mint data-tokens with a given ratio of OCEAN/datatoken like 50-50 70-30 or 90-10
      // The TVL of the pool, like any AMM, should account for both sides of the liquidity: OCEAN (from balanceOf) + datatoken (using weight) 
      const {output: weights} = await sdk.api.abi.multiCall({
        abi: abi['pool_getNormalizedWeight'],
        calls: pools.map(pool => ({
          target: pool.id,
          params: [OCEAN]
        })),
        block,
        chain
      });

      OCEAN_balances.output.forEach((v,i) => {
        const w = (new BigNumber(weights[i].output || '0')).div(1e18) 
        OCEAN_balances.output[i].output = (new BigNumber(v.output).idiv(w)).toString(10)
      })
      sdk.util.sumMultiBalanceOf(balances, OCEAN_balances, true, transform);
      // sdk.util.sumSingleBalance(balances, 'ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', query.poolFactories[0].totalValueLocked)
    }
    return balances;
  }
}

module.exports = {
  methodology: 'OCEAN TVL is OCEAN locked as a stake in each pool of data + the balance of datatokens of each pool like any AMM - inferred from the pools weights',
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
  
}
