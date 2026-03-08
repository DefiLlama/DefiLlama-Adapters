const {  getAddress } = require('ethers');
const { gql } = require('graphql-request');

const CV_STRATEGY_ABI = {
  getPoolAmount: 'function getPoolAmount() view returns (uint256)',
};
const COMMON_POOL_STRATEGY = '0x96dee4849a6ab9e51ae36712794318001515dc91';

const subgraphs = {
  polygon: 'https://api.studio.thegraph.com/query/102093/gardens-v2---polygon/version/latest/',
  xdai: 'https://api.studio.thegraph.com/query/102093/gardens-v2---gnosis/version/latest/',
  arbitrum: 'https://api.studio.thegraph.com/query/102093/gardens-v2---arbitrum/latest/',
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

  // Strategy balances should use getPoolAmount() to include wrapped token accounting.
  const strategyCalls = strategies.map(s => ({ target: s.id }));
  const strategyBalances = await api.multiCall({ abi: CV_STRATEGY_ABI.getPoolAmount, calls: strategyCalls, permitFailure: true });
  if (strategyBalances.length !== strategyCalls.length) {
    throw new Error(`Mismatched strategy balances and calls length on ${api.chain}`);
  }

  strategyBalances.forEach((balance, i) => {
    if (BigInt(balance || 0) > 0n) {
      const token = getAddress(strategies[i].token);
      api.add(token, balance);
    }
  });

  const commonPoolIndex = api.chain === 'xdai'
    ? strategies.findIndex(s => s.id?.toLowerCase() === COMMON_POOL_STRATEGY)
    : -1;
  if (commonPoolIndex !== -1) {
    const { id, token } = strategies[commonPoolIndex];
    const [tokenBalance] = await api.multiCall({
      abi: 'erc20:balanceOf',
      calls: [{ target: token, params: [id] }],
      permitFailure: true,
    });
    console.log(`[Gardens-v2][xdai] Common pool ${id} token=${token} balanceOf=${tokenBalance || 0} getPoolAmount=${strategyBalances[commonPoolIndex] || 0}`);
  }

  const communityCalls = communities
    .filter(c => c.garden?.id)
    .map(c => ({ target: c.garden.id, params: [c.id] }));
  const communityBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: communityCalls, permitFailure: true });
  if (communityBalances.length !== communityCalls.length) {
    throw new Error(`Mismatched community balances and calls length on ${api.chain}`);
  }

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
};
