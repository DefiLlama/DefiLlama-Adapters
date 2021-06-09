const sdk = require("@defillama/sdk");
const abi = require('./abi.json')
const { unwrapUniswapLPs } = require('../helper/unwrapLPs')
const { request, gql } = require("graphql-request");


//get their pool addresses from the subgraph
const graphUrl =
  'https://api.thegraph.com/subgraphs/name/visorfinance/visor';

const graphQuery = gql` 
{
  hypervisors(first: 10){
    id
    stakingToken{
      id
      symbol
    }
    totalStakedAmount
  }
}
`;

async function tvl(timestamp, block) {
  const balances = {};

  //get the staking pool contracts, and the respective token addresses
  const resp = await request(
    graphUrl,
    graphQuery
  );

  for (i = 0; i < resp.hypervisors.length; i++) {
    const curr = resp.hypervisors[i];
    const stakingPoolAddr = curr.id;
    const tokenAddr = curr.stakingToken.id;

    const tokenLocked = await sdk.api.abi.call({
      target: stakingPoolAddr,
      abi: abi["getHyperVisorData"],
      block: block
    });

    if (curr.stakingToken.symbol == 'UNI-V2') {
      await unwrapUniswapLPs(balances, [{
        token: tokenAddr,
        balance: tokenLocked.output.totalStake,
      }], block)
    }
    else {
      balances[tokenAddr] = tokenLocked.output.totalStake
    }
  }
  return balances;
}

module.exports = {
  name: 'Visor',               // project name
  website: 'https://www.visor.finance/',
  token: 'VISR',
  category: 'Other',          // Lending
  start: 1616679762,            // (Mar-25-2021 01:42:42 PM +UTC)
  tvl                           // tvl adapter
}

