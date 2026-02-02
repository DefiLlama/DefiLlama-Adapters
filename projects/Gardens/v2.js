const {  getAddress } = require('ethers');
const { gql } = require('graphql-request');

const subgraphs = {
  polygon: 'https://api.studio.thegraph.com/query/102093/gardens-v2---polygon/version/latest/',
  xdai: 'https://api.studio.thegraph.com/query/102093/gardens-v2---gnosis/version/latest/',
  arbitrum: 'https://api.studio.thegraph.com/query/102093/gardens-v2---arbitrum/version/latest/',
  base: 'https://api.studio.thegraph.com/query/102093/gardens-v2---base/version/latest/',
  celo: 'https://api.studio.thegraph.com/query/102093/gardens-v2---celo/version/latest/',
  optimism: 'https://api.studio.thegraph.com/query/102093/gardens-v2---optimism/version/latest/',
};


const query = gql`
{
  cvstrategies(where: {config_:{
    proposalType_not: 0
  }}) {
    id
    token
  }
  
  registryCommunities {
    id
    garden {
      id
    }
  }
}
`

async function fetchStrategiesAndCommunities(api) {
  const subgraph = subgraphs[api.chain];
  if (!subgraph) throw new Error(`No subgraph for chain ${api.chain}`);

  const data = await fetch(subgraph, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) })
    .then(res => res.json())
    .then(res => res.data);
  if (!data) throw new Error(`No data from subgraph for chain ${api.chain}`);
  if (!data.cvstrategies || !data.registryCommunities) throw new Error(`Missing data from subgraph for chain ${api.chain}`);
  const strategies = data.cvstrategies;
  const communities = data.registryCommunities;

  return { strategies, communities };
}

async function tvl(api) {
  const { strategies, communities } = await fetchStrategiesAndCommunities(api);

  // Multi calls 
  const calls = strategies.map(s => ({ target: s.token, params: [s.id] }));
  communities.forEach(c => {
    if (c.garden?.id) {
      calls.push({ target: c.garden.id, params: [c.id] });
    }
  });

  // Multicall
  const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls, permitFailure: true });

  // If not same length, something went wrong
  if (balances.length !== calls.length) {
    throw new Error(`Mismatched balances and calls length on ${api.chain}`);
  }

  balances.forEach((balance, i) => {
    if (BigInt(balance || 0) > 0n) {
      const token = getAddress(calls[i].target);
      api.add(token, balance);
    }
  });  
}

module.exports = {
  methodology: 'Uses ethers.getLogs with chunking to read CommunityCreated events from proxy factories.',
  start: 1640995200,
  xdai: { tvl },
  arbitrum: { tvl },
  base: { tvl },
  optimism: { tvl },
  polygon: { tvl },
  celo: { tvl },
};
