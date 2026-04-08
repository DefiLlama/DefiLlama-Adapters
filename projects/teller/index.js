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
const BID_STATE_ACCEPTED = '3';
const COLLATERAL_ERC20 = '0';

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

async function getPoolBidData(chain) {
  const activeBids = [];
  const allPoolBidIds = new Set();

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
      allPoolBidIds.add(bid.bid_id);
      if (!closedBidIds.has(bid.bid_id)) {
        activeBids.push(bid);
      }
    }
  }

  return { activeBids, allPoolBidIds };
}

async function getTellerV2Info(api, pools) {
  if (pools.length === 0) return null;
  let tellerV2;
  for (const pool of pools) {
    try {
      tellerV2 = await api.call({ target: pool.group_pool_address, abi: 'function TELLER_V2() view returns (address)' });
      if (tellerV2 && tellerV2 !== ZERO_ADDR) break;
    } catch (e) { continue; }
  }
  if (!tellerV2) return null;
  const collateralManager = await api.call({ target: tellerV2, abi: 'function collateralManager() view returns (address)' });
  let totalBids;
  try {
    totalBids = Number(await api.call({ target: tellerV2, abi: 'function bidId() view returns (uint256)' }));
  } catch (e) {
    // Binary search for the bid counter
    let lo = 0, hi = 50000;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      try {
        const state = await api.call({ target: tellerV2, abi: 'function getBidState(uint256) view returns (uint8)', params: [mid] });
        if (String(state) === '0') hi = mid; else lo = mid + 1;
      } catch (e) { hi = mid; }
    }
    totalBids = lo;
  }
  return { tellerV2, collateralManager, totalBids };
}

async function getDirectBids(api, tellerInfo, allPoolBidIds) {
  if (!tellerInfo) return [];
  const { tellerV2, collateralManager, totalBids } = tellerInfo;

  // Scan all bids for ACCEPTED state
  const batchSize = 500;
  const acceptedDirectIds = [];

  for (let start = 0; start < totalBids; start += batchSize) {
    const ids = [];
    for (let i = start; i < Math.min(start + batchSize, totalBids); i++) ids.push(i.toString());

    const states = await api.multiCall({
      target: tellerV2,
      calls: ids,
      abi: 'function getBidState(uint256) view returns (uint8)',
      permitFailure: true,
    });

    for (let i = 0; i < ids.length; i++) {
      if (String(states[i]) === BID_STATE_ACCEPTED && !allPoolBidIds.has(ids[i])) {
        acceptedDirectIds.push(ids[i]);
      }
    }
  }

  if (acceptedDirectIds.length === 0) return [];

  // Check defaulted status
  const defaultedFlags = await api.multiCall({
    target: tellerV2,
    calls: acceptedDirectIds,
    abi: 'function isLoanDefaulted(uint256) view returns (bool)',
    permitFailure: true,
  });

  // Get loan details, escrow addresses, and collateral info for all accepted direct bids
  const [details, escrows, collateralInfos] = await Promise.all([
    api.multiCall({
      target: tellerV2,
      calls: acceptedDirectIds,
      abi: 'function getLoanSummary(uint256) view returns (address borrower, address lender, uint256 marketId, address principalTokenAddress, uint256 principalAmount, uint32 acceptedTimestamp, uint32 lastRepaidTimestamp, uint8 bidState)',
      permitFailure: true,
    }),
    api.multiCall({
      target: collateralManager,
      calls: acceptedDirectIds,
      abi: 'function _escrows(uint256) view returns (address)',
      permitFailure: true,
    }),
    api.multiCall({
      target: collateralManager,
      calls: acceptedDirectIds,
      abi: 'function getCollateralInfo(uint256) view returns (tuple(uint8 _collateralType, uint256 _amount, uint256 _tokenId, address _collateralAddress)[])',
      permitFailure: true,
    }),
  ]);

  const results = [];
  for (let i = 0; i < acceptedDirectIds.length; i++) {
    if (!escrows[i] || escrows[i] === ZERO_ADDR) continue;
    const isDefaulted = defaultedFlags[i] === true || defaultedFlags[i] === 'true';
    results.push({
      bidId: acceptedDirectIds[i],
      principalToken: details[i]?.principalTokenAddress,
      principalAmount: details[i]?.principalAmount,
      escrow: escrows[i],
      collaterals: collateralInfos[i] || [],
      defaulted: isDefaulted,
    });
  }

  return results;
}

async function getPoolEscrowTokens(api, pools, activeBids, collateralManager) {
  if (activeBids.length === 0) return [];

  const poolCollateral = {};
  for (const pool of pools) {
    if (pool.collateral_token_address && pool.collateral_token_address !== ZERO_ADDR)
      poolCollateral[pool.group_pool_address.toLowerCase()] = pool.collateral_token_address;
  }

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
  const [pools, poolBidData] = await Promise.all([
    getPoolConfigs(api.chain),
    getPoolBidData(api.chain),
  ]);
  const { activeBids, allPoolBidIds } = poolBidData;

  const tokensAndOwners = [];

  // Pool token balances
  for (const pool of pools) {
    const owner = pool.group_pool_address;
    if (pool.principal_token_address && pool.principal_token_address !== ZERO_ADDR)
      tokensAndOwners.push([pool.principal_token_address, owner]);
    if (pool.collateral_token_address && pool.collateral_token_address !== ZERO_ADDR)
      tokensAndOwners.push([pool.collateral_token_address, owner]);
  }

  // Get TellerV2 info
  const tellerInfo = await getTellerV2Info(api, pools);
  if (tellerInfo) {
    // Pool escrow collateral
    const poolEscrowTokens = await getPoolEscrowTokens(api, pools, activeBids, tellerInfo.collateralManager);
    tokensAndOwners.push(...poolEscrowTokens);

    // Direct (non-pool) bid ERC20 collateral (active + defaulted, skipping NFTs)
    const directBids = await getDirectBids(api, tellerInfo, allPoolBidIds);
    for (const bid of directBids) {
      for (const c of bid.collaterals) {
        if (c._collateralAddress && c._collateralAddress !== ZERO_ADDR && String(c._collateralType) === COLLATERAL_ERC20) {
          tokensAndOwners.push([c._collateralAddress, bid.escrow]);
        }
      }
    }
  }

  return sumTokens2({ api, tokensAndOwners, permitFailure: true });
}

async function borrowed(api) {
  const [pools, poolBidData] = await Promise.all([
    getPoolConfigs(api.chain),
    getPoolBidData(api.chain),
  ]);
  const { activeBids, allPoolBidIds } = poolBidData;
  const addresses = pools.map(p => p.group_pool_address);

  const tellerInfo = await getTellerV2Info(api, pools);

  // Pool borrowed
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

  // Subtract defaulted pool loan principal from pool borrowed totals
  if (tellerInfo && activeBids.length > 0) {
    const poolBidIds = activeBids.map(b => b.bid_id);
    const defaultedFlags = await api.multiCall({
      target: tellerInfo.tellerV2,
      calls: poolBidIds,
      abi: 'function isLoanDefaulted(uint256) view returns (bool)',
      permitFailure: true,
    });

    const defaultedBidIds = [];
    for (let i = 0; i < poolBidIds.length; i++) {
      if (defaultedFlags[i] === true || defaultedFlags[i] === 'true') {
        defaultedBidIds.push(poolBidIds[i]);
      }
    }

    if (defaultedBidIds.length > 0) {
      const timestamp = api.timestamp;
      const [defaultedOwed, defaultedDetails] = await Promise.all([
        api.multiCall({
          target: tellerInfo.tellerV2,
          calls: defaultedBidIds.map(id => ({ params: [id, timestamp] })),
          abi: 'function calculateAmountOwed(uint256, uint256) view returns (uint256 principal, uint256 interest)',
          permitFailure: true,
        }),
        api.multiCall({
          target: tellerInfo.tellerV2,
          calls: defaultedBidIds,
          abi: 'function getLoanSummary(uint256) view returns (address borrower, address lender, uint256 marketId, address principalTokenAddress, uint256 principalAmount, uint32 acceptedTimestamp, uint32 lastRepaidTimestamp, uint8 bidState)',
          permitFailure: true,
        }),
      ]);

      for (let i = 0; i < defaultedBidIds.length; i++) {
        const owed = defaultedOwed[i];
        const detail = defaultedDetails[i];
        if (!owed || !detail?.principalTokenAddress) continue;
        const principal = owed.principal || owed[0];
        if (principal && BigInt(principal) > 0n) {
          api.add(detail.principalTokenAddress, -BigInt(principal));
        }
      }
    }
  }

  // Direct (non-pool) bid borrowed — only non-defaulted loans
  if (tellerInfo) {
    const directBids = await getDirectBids(api, tellerInfo, allPoolBidIds);
    const activeDirectBids = directBids.filter(b => !b.defaulted);
    const bidIds = activeDirectBids.map(b => b.bidId);

    if (bidIds.length > 0) {
      const timestamp = api.timestamp;
      const amountsOwed = await api.multiCall({
        target: tellerInfo.tellerV2,
        calls: bidIds.map(id => ({ params: [id, timestamp] })),
        abi: 'function calculateAmountOwed(uint256, uint256) view returns (uint256 principal, uint256 interest)',
        permitFailure: true,
      });

      for (let i = 0; i < activeDirectBids.length; i++) {
        const owed = amountsOwed[i];
        if (!owed || !activeDirectBids[i].principalToken) continue;
        const principal = owed.principal || owed[0];
        if (principal && BigInt(principal) > 0n) {
          api.add(activeDirectBids[i].principalToken, principal.toString());
        }
      }
    }
  }
}

module.exports = {
  methodology: "TVL is pool token balances plus collateral in escrow contracts for active loans (pool and direct). Borrowed is outstanding principal from pools plus active direct TellerV2 loans, excluding defaulted loans, all on-chain.",
  timetravel: false,
};

[...new Set([...Object.keys(POOLS_V2), ...Object.keys(POOLS_V1)])].forEach(chain => {
  module.exports[chain] = { tvl, borrowed };
});
