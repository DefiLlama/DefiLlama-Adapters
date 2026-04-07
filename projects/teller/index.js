const { cachedGraphQuery } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Pool V2 subgraphs (Ormi Labs for EVM chains, Goldsky for katana/hyperliquid)
const POOLS_V2 = {
  ethereum:    'https://api.subgraph.migration.ormilabs.com/subgraphs/id/QmW6TetrwFmjiCrTCW15SskJThJvRTvpJVrRNtGMBX51Ag',
  polygon:     'https://api.subgraph.migration.ormilabs.com/subgraphs/id/QmSdT2h3HGXjZ6j2YtTWRJFVm8EJYumzcnfRAgCoFxczmR',
  arbitrum:    'https://api.subgraph.migration.ormilabs.com/subgraphs/id/QmSexfnJV8EZTuVmoXaXJTKpJ7Q6ymPmPV7ShppTWZFe12',
  base:        'https://api.subgraph.migration.ormilabs.com/subgraphs/id/Qmb86xPeygvQFMmNN9j8aiCXqqFrcsKHu6nTrqfQwPeoqb',
  katana:      'https://api.goldsky.com/api/public/project_cme01oezy1dwd01um5nile55y/subgraphs/teller-pools-v2-katana/0.4.21.12/gn',
  hyperliquid: 'https://api.goldsky.com/api/public/project_cme01oezy1dwd01um5nile55y/subgraphs/teller-pools-v2-hyperevm/0.4.21.8/gn',
};

// Pool V1 subgraphs (Ormi Labs — separate pool contracts, combined with V2)
const POOLS_V1 = {
  ethereum: 'https://api.subgraph.migration.ormilabs.com/subgraphs/id/QmSSDg8XePRJu5zibC955LHNV9Au5GPq7qPcUTrmsQu8Wt',
  polygon:  'https://api.subgraph.migration.ormilabs.com/subgraphs/id/QmSeGXy47e9jPAjuaxQ5WwQthzCmMfthh3NKNzLTNm7Cmw',
  arbitrum: 'https://api.subgraph.migration.ormilabs.com/subgraphs/id/Qme9KeTZdLrVyHh3QRucvjgfnHKkmndjqGEW6hMFKxWv3o',
  base:     'https://api.subgraph.migration.ormilabs.com/subgraphs/id/QmekaTZkP9r4mHHawko2z4YLHo7XTfNZ7FrbotViDe6pYt',
};

const ZERO_ADDR = '0x0000000000000000000000000000000000000000';

const poolQuery = `
  query ($lastId: ID) {
    groupPoolMetrics(first: 1000, where: { id_gt: $lastId }) {
      id
      group_pool_address
      principal_token_address
      collateral_token_address
    }
  }
`;

async function getPoolConfigs(chain) {
  const pools = [];

  if (POOLS_V2[chain]) {
    const v2 = await cachedGraphQuery(`teller-v2-${chain}`, POOLS_V2[chain], poolQuery, { fetchById: true });
    if (Array.isArray(v2)) pools.push(...v2);
  }

  if (POOLS_V1[chain]) {
    const v1 = await cachedGraphQuery(`teller-v1-${chain}`, POOLS_V1[chain], poolQuery, { fetchById: true });
    if (Array.isArray(v1)) pools.push(...v1);
  }

  return pools;
}

async function tvl(api) {
  const pools = await getPoolConfigs(api.chain);
  const tokensAndOwners = [];

  for (const pool of pools) {
    const owner = pool.group_pool_address;
    if (pool.principal_token_address && pool.principal_token_address !== ZERO_ADDR)
      tokensAndOwners.push([pool.principal_token_address, owner]);
    if (pool.collateral_token_address && pool.collateral_token_address !== ZERO_ADDR)
      tokensAndOwners.push([pool.collateral_token_address, owner]);
  }

  return sumTokens2({ api, tokensAndOwners, permitFailure: true });
}

async function borrowed(api) {
  const pools = await getPoolConfigs(api.chain);
  const addresses = pools.map(p => p.group_pool_address);

  const [lended, repaid, tokens] = await Promise.all([
    api.multiCall({ calls: addresses, abi: 'function totalPrincipalTokensLended() view returns (uint256)', permitFailure: true }),
    api.multiCall({ calls: addresses, abi: 'function totalPrincipalTokensRepaid() view returns (uint256)', permitFailure: true }),
    api.multiCall({ calls: addresses, abi: 'function getPrincipalTokenAddress() view returns (address)', permitFailure: true }),
  ]);

  for (let i = 0; i < pools.length; i++) {
    if (!lended[i] || !repaid[i] || !tokens[i]) continue;
    const outstanding = BigInt(lended[i]) - BigInt(repaid[i]);
    if (outstanding > 0n) {
      api.add(tokens[i], outstanding.toString());
    }
  }
}

module.exports = {
  methodology: "TVL is pool token balances read on-chain via cached subgraph config. Borrowed is outstanding principal computed on-chain (lended - repaid).",
  timetravel: false,
};

["ethereum", "polygon", "arbitrum", "base", "katana", "hyperliquid"].forEach(chain => {
  module.exports[chain] = { tvl, borrowed };
});
