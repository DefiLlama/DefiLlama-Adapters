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

const bidQuery = `
  query ($lastId: ID) {
    groupPoolBids(first: 1000, where: { id_gt: $lastId }) {
      id
      group_pool_address
      bid_id
    }
  }
`;

const repaidQuery = `
  query ($lastId: ID) {
    groupLoanRepaids(first: 1000, where: { id_gt: $lastId }) {
      id
      bid_id
    }
  }
`;

const liquidatedQuery = `
  query ($lastId: ID) {
    groupDefaultedLoanLiquidateds(first: 1000, where: { id_gt: $lastId }) {
      id
      bid_id
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

async function getActiveBidIds(chain) {
  const activeBids = [];

  for (const [label, subgraphs] of [['v2', POOLS_V2], ['v1', POOLS_V1]]) {
    if (!subgraphs[chain]) continue;
    const url = subgraphs[chain];

    const [allBids, repaid, liquidated] = await Promise.all([
      cachedGraphQuery(`teller-bids-${label}-${chain}`, url, bidQuery, { fetchById: true }),
      cachedGraphQuery(`teller-repaid-${label}-${chain}`, url, repaidQuery, { fetchById: true }),
      cachedGraphQuery(`teller-liquidated-${label}-${chain}`, url, liquidatedQuery, { fetchById: true }),
    ]);

    if (!Array.isArray(allBids)) continue;

    const closedBidIds = new Set();
    if (Array.isArray(repaid)) repaid.forEach(b => closedBidIds.add(b.bid_id));
    if (Array.isArray(liquidated)) liquidated.forEach(b => closedBidIds.add(b.bid_id));

    for (const bid of allBids) {
      if (!closedBidIds.has(bid.bid_id)) {
        activeBids.push(bid);
      }
    }
  }

  return activeBids;
}

async function getCollateralEscrowTokens(api, pools, activeBids) {
  if (activeBids.length === 0) return [];

  // Build a map of pool address -> collateral token
  const poolCollateral = {};
  for (const pool of pools) {
    if (pool.collateral_token_address && pool.collateral_token_address !== ZERO_ADDR)
      poolCollateral[pool.group_pool_address.toLowerCase()] = pool.collateral_token_address;
  }

  // Get TellerV2 address from the first pool that has active bids
  const firstPool = activeBids[0].group_pool_address;
  const tellerV2 = await api.call({ target: firstPool, abi: 'function TELLER_V2() view returns (address)' });
  const collateralManager = await api.call({ target: tellerV2, abi: 'function collateralManager() view returns (address)' });

  // Get escrow addresses for all active bids
  const escrows = await api.multiCall({
    target: collateralManager,
    calls: activeBids.map(b => b.bid_id),
    abi: 'function _escrows(uint256) view returns (address)',
    permitFailure: true,
  });

  const tokensAndOwners = [];
  for (let i = 0; i < activeBids.length; i++) {
    const escrow = escrows[i];
    if (!escrow || escrow === ZERO_ADDR) continue;
    const collateralToken = poolCollateral[activeBids[i].group_pool_address.toLowerCase()];
    if (collateralToken) {
      tokensAndOwners.push([collateralToken, escrow]);
    }
  }

  return tokensAndOwners;
}

async function tvl(api) {
  const [pools, activeBids] = await Promise.all([
    getPoolConfigs(api.chain),
    getActiveBidIds(api.chain),
  ]);

  const tokensAndOwners = [];

  for (const pool of pools) {
    const owner = pool.group_pool_address;
    if (pool.principal_token_address && pool.principal_token_address !== ZERO_ADDR)
      tokensAndOwners.push([pool.principal_token_address, owner]);
    if (pool.collateral_token_address && pool.collateral_token_address !== ZERO_ADDR)
      tokensAndOwners.push([pool.collateral_token_address, owner]);
  }

  // Add collateral held in per-loan escrow contracts
  const escrowTokens = await getCollateralEscrowTokens(api, pools, activeBids);
  tokensAndOwners.push(...escrowTokens);

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
  methodology: "TVL is pool token balances plus collateral held in per-loan escrow contracts, all read on-chain. Borrowed is outstanding principal computed on-chain (lended - repaid).",
  timetravel: false,
};

["ethereum", "polygon", "arbitrum", "base", "katana", "hyperliquid"].forEach(chain => {
  module.exports[chain] = { tvl, borrowed };
});
