const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const abi = require('./abi.json')

const graphUrl = 'https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_1_0'
const graphQuery = gql`
query GET_POOLS($block: Int) {
  prizePools(
    block: { number: $block }
  ) {
    id
    underlyingCollateralSymbol
    underlyingCollateralToken
    compoundPrizePool{
      cToken
    }
  }
}
`;

async function tvl(timestamp, block) {
  let balances = {};

  const { prizePools } = await request(
    graphUrl,
    graphQuery,
    {
      block,
    }
  );
  const lockedTokens = await sdk.api.abi.multiCall({
    abi: abi['accountedBalance'],
    calls: prizePools.map(pool=>({
      target: pool.id
    })),
    block
  })
  lockedTokens.output.forEach(call=>{
    const underlyingToken = prizePools.find(pool=>pool.id===call.input.target).underlyingCollateralToken;
    const underlyingTokenBalance = call.output
    sdk.util.sumSingleBalance(balances, underlyingToken, underlyingTokenBalance)
  })
  return balances
}
  

module.exports = {
  name: 'PoolTogether',
  token: 'POOL',
  category: 'staking',
  start: 0, // WRONG!
  tvl
}