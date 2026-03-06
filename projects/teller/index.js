const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk');

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

// Borrower subgraphs (The Graph Network + Goldsky for hyperliquid)
const BORROWER = {
  ethereum:    sdk.graph.modifyEndpoint('https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/4JruhWH1ZdwvUuMg2xCmtnZQYYHvmEq6cmTcZkpM6pW'),
  polygon:     sdk.graph.modifyEndpoint('https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/8bjHtQZ9PZUMQAbCGJw5Zx2SbZZY2LQz8WH3rURzN5do'),
  arbitrum:    sdk.graph.modifyEndpoint('https://gateway.thegraph.com/api/[api-key]/subgraphs/id/F2Cgx4q4ATiopuZ13nr1EMKmZXwfAdevF3EujqfayK7a'),
  base:        sdk.graph.modifyEndpoint('https://gateway.thegraph.com/api/[api-key]/subgraphs/id/8jSq7mzq9HEiJEcAZfvrTT4wYk59oMxm82xUpcVBzryF'),
  katana:      sdk.graph.modifyEndpoint('https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/CfcwmqFDd425rEFQVFk52tJmquETeBiUCmK7kv2DHkPs'),
  hyperliquid: 'https://api.goldsky.com/api/public/project_cme01oezy1dwd01um5nile55y/subgraphs/teller-v2-hyperevm/0.4.21.5/gn',
};

const poolMetricsQuery = gql`
  query ($skip: Int!) {
    groupPoolMetrics(first: 1000, skip: $skip) {
      principal_token_address
      total_principal_tokens_committed
      total_interest_collected
      total_principal_tokens_withdrawn
    }
  }
`;

const activeBidsQuery = gql`
  query ($skip: Int!) {
    bids(first: 1000, skip: $skip, where: { status_in: ["Accepted", "Due Soon", "Late", "Defaulted"] }) {
      principal
      lendingToken { address decimals }
      collateral { amount collateralAddress }
    }
  }
`;

async function paginate(endpoint, query, key) {
  let all = [];
  let skip = 0;
  while (true) {
    const data = await request(endpoint, query, { skip });
    const batch = data[key] || [];
    all = all.concat(batch);
    if (batch.length < 1000) break;
    skip += 1000;
  }
  return all;
}

// V1 and V2 are separate pool contracts — combine both
async function getPoolMetrics(chain) {
  const fetches = [];
  if (POOLS_V2[chain]) fetches.push(paginate(POOLS_V2[chain], poolMetricsQuery, 'groupPoolMetrics').catch(e => { sdk.log('V2 pool subgraph failed for', chain, e.message); return []; }));
  if (POOLS_V1[chain]) fetches.push(paginate(POOLS_V1[chain], poolMetricsQuery, 'groupPoolMetrics').catch(e => { sdk.log('V1 pool subgraph failed for', chain, e.message); return []; }));
  const results = await Promise.all(fetches);
  return results.flat();
}

async function getActiveBids(chain) {
  if (!BORROWER[chain]) return [];
  try {
    return await paginate(BORROWER[chain], activeBidsQuery, 'bids');
  } catch (e) {
    sdk.log('Borrower subgraph failed for', chain, e.message);
    return [];
  }
}

async function tvl(api) {
  const chain = api.chain;
  const [pools, bids] = await Promise.all([getPoolMetrics(chain), getActiveBids(chain)]);

  // Pool available liquidity (committed + interest - withdrawn)
  for (const pool of pools) {
    const committed = BigInt(pool.total_principal_tokens_committed || '0');
    const interest = BigInt(pool.total_interest_collected || '0');
    const withdrawn = BigInt(pool.total_principal_tokens_withdrawn || '0');
    const available = committed + interest - withdrawn;

    if (available > 0n) {
      api.add(pool.principal_token_address, available.toString());
    }
  }

  // Active loans: add borrowed principal + collateral
  for (const bid of bids) {
    // Borrowed principal counts as supply-side TVL (capital deployed by lenders)
    if (bid.principal && bid.lendingToken?.address) {
      api.add(bid.lendingToken.address, bid.principal);
    }
    // Collateral locked in active loans
    if (bid.collateral) {
      for (const c of bid.collateral) {
        if (c.amount && c.collateralAddress) {
          api.add(c.collateralAddress, c.amount);
        }
      }
    }
  }
}

async function borrowed(api) {
  const bids = await getActiveBids(api.chain);
  for (const bid of bids) {
    if (bid.principal && bid.lendingToken?.address) {
      api.add(bid.lendingToken.address, bid.principal);
    }
  }
}

module.exports = {
  methodology: "TVL is computed from Teller pool subgraphs (supply-side deposits) plus borrowed principal and collateral locked in active loans from borrower subgraphs.",
  timetravel: false,
};

["ethereum", "polygon", "arbitrum", "base", "katana", "hyperliquid"].forEach(chain => {
  module.exports[chain] = { tvl, borrowed };
});
