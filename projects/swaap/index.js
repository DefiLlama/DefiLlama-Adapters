const sdk = require('@defillama/sdk');
const { GraphQLClient, gql } = require("graphql-request");


const configV1 =  {
  polygon: {
    startBlock: 29520285,
    blockDelay: 30,
    theGraph: {
      endpoint: 'https://api.thegraph.com/subgraphs/name/swaap-labs/swaapv1',
      query: `pools: pools(orderBy: liquidity, orderDirection: desc) {
        id
        tokens {
          address
        }
      }`
    }
  }
}

function tvlFunctionGetterV1(chain) {
  
  return async function tvlFunction(timestamp, ethBlock, chainBlocks) {
  
    var graphQLClient = new GraphQLClient(configV1[chain]['theGraph']['endpoint']);

    const block = configV1[chain]['startBlock'] + configV1[chain]['blockDelay'] > configV1[chain]['startBlock'] ? 
      configV1[chain]['startBlock'] : chainBlocks[chain] - configV1[chain]['blockDelay'] // delayed to allow subgraph to update
    
    const fetchAllPools = gql`query ($block: Int) { ${configV1[chain]['theGraph']['query']} }`;
    const results = await graphQLClient.request(fetchAllPools, {
      block,
    });

    let poolCalls = [];
    results.pools.forEach((pool) => {
      let poolTokens = pool.tokens;
      let poolAddress = pool.id;
      poolTokens.forEach((token) => {
        poolCalls.push({
          target: token.address,
          params: poolAddress,
        });
      })
    });

    let poolBalances = await sdk.api.abi.multiCall({
      block,
      calls: poolCalls,
      abi: 'erc20:balanceOf',
      chain
    });

    const balances = {}
    sdk.util.sumMultiBalanceOf(
      balances, 
      poolBalances, 
      true, 
      addr => `${chain}:${addr}`
    )

    return balances

  }

}

module.exports = {
  start: 1655130642, // Jun-13-2022 02:30:42 PM +UTC
  timetravel: true,
  misrepresentedTokens: false,
  methodology: `The TVL is retrieved using a mix of TheGraph (to get the list of pools) and on-chain (to get the pools' assets balance) calls.`,
  polygon: {
    tvl: tvlFunctionGetterV1("polygon"),
  },
  hallmarks:[]
};
