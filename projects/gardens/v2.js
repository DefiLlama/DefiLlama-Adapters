const {  getAddress } = require('ethers');
const { gql } = require('graphql-request');

const CV_STRATEGY_ABI = {
  getPoolAmount: 'function getPoolAmount() view returns (uint256)',
};

const subgraphs = {
  polygon: 'https://gateway.thegraph.com/api/{api-key}/subgraphs/id/4vsznmRkUGm9DZFBwvC6PDvGPVfVLQcUUr5ExdTNZiUc',
  xdai: 'https://gateway.thegraph.com/api/{api-key}/subgraphs/id/ELGHrYhvJJQrYkVsYWS5iDuFpQ1p834Q2k2kBmUAVZAi',
  arbitrum: 'https://gateway.thegraph.com/api/{api-key}/subgraphs/id/9ejruFicuLT6hfuXNTnS8UCwxTWrHz4uinesdZu1dKmk',
  base: 'https://gateway.thegraph.com/api/{api-key}/subgraphs/id/HAjsxiYJEkV8oDZgVTaJE9NQ2XzgqekFbY99tMGu53eJ',
  celo: 'https://gateway.thegraph.com/api/{api-key}/subgraphs/id/BsXEnGaXdj3CkGRn95bswGcv2mQX7m8kNq7M7WBxxPx8',
  optimism: 'https://gateway.thegraph.com/api/{api-key}/subgraphs/id/FmcVWeR9xdJyjM53DPuCvEdH24fSXARdq4K5K8EZRZVp',
  ethereum: 'https://gateway.thegraph.com/api/{api-key}/subgraphs/id/39E6r8bqUTeyrSb4JWMkqcVBKqeKAwJVp6mPhoDCtgbB',
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

  const res = await fetch(subgraph, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer cac537bc551071b0753a5769fb37685c` }, body: JSON.stringify({ query }) })
    .then(res => res.json());
  const data = res.data;
  if (!data) {
    console.error(`Error fetching data from subgraph for chain ${api.chain}:`, res);
    throw new Error(`No data from subgraph for chain ${api.chain}`);
  }
  if (!data.cvstrategies || !data.registryCommunities) throw new Error(`Missing data from subgraph for chain ${api.chain}`);
  const strategies = data.cvstrategies;
  const communities = data.registryCommunities;

  return { strategies, communities };
}

async function tvl(api) {
  const { strategies, communities } = await fetchStrategiesAndCommunities(api);

  // Strategy balances should use getPoolAmount() to include wrapped token accounting.
  const strategyCalls = strategies.map(s => ({ target: s.id }));
  const strategyBalances = await api.multiCall({ abi: CV_STRATEGY_ABI.getPoolAmount, calls: strategyCalls, permitFailure: true });

  strategyBalances.forEach((balance, i) => {
    const token = strategies[i].token;
    if(token && BigInt(balance || 0) > 0n) {
      const tokenAddress = getAddress(token);
      api.add(tokenAddress, balance);
    }
  });

  const communityCalls = communities
    .filter(c => c.garden?.id)
    .map(c => ({ target: c.garden.id, params: [c.id] }));
  const communityBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: communityCalls, permitFailure: true });

  communityBalances.forEach((balance, i) => {
    if (BigInt(balance || 0) > 0n) {
      const token = getAddress(communityCalls[i].target);
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
  ethereum: { tvl },
};
