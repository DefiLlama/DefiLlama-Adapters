const { gql, request } = require('graphql-request');
const { SUBGRAPH_URL } = require('./constants');

// Fetches vaults that have tokens deposited and are available to be used on the platform.
// Broken vaults (withdrawEnabled) cannot be used in a loan.
const fetchVaultQuery = gql`
  query {
    arcadeVaults(first: <FIRST>, where:{hasCollateral:true, withdrawEnabled:false, cursor_gte: <CURSOR>}) {
      address
    }
  }
`;

// Helper function to fetch the first 1000 vaults
async function fetchVaults() {
  return fetchVaultsPaginated(1000);
}

// Max recursion depth
const MAX_DEPTH = 100;

// Continues to fetch vaults from the subgraph until there are no results
async function fetchVaultsPaginated(limit = 100, cursor = 0, depth = 0) {
  // Defensive so we don't give DeFiLlama engineers a headache
  if (cursor < 0 || depth >= MAX_DEPTH) {
    return [];
  }

  const first = limit ?? 100;
  const start = cursor ?? 0;

  let query = fetchVaultQuery.replace('<FIRST>', first);
  query = query.replace('<CURSOR>', start);

  const res = await request(SUBGRAPH_URL, query);
  const vaults = res.arcadeVaults ?? [];

  // There could be more vaults if the number of results matches the query limit
  if (vaults.length >= first) {
    // Get the cursor for the last vault
    const lastCursor = vaults[first - 1].cursor ?? -1;

    // Fetch more vaults starting from the last cursor + 1, inclusive
    const moreVaults = await fetchVaultsPaginated(limit, lastCursor + 1, depth + 1);
    return vaults.concat(moreVaults);
  }

  return vaults;
}

module.exports = {
  fetchVaults,
  fetchVaultsPaginated,
}
