const { gql, request } = require('graphql-request');
const { SUBGRAPH_URL } = require('./constants');

// Max recursion depth
const MAX_DEPTH = 100;

// Fetch from the SG until there are no results
async function fetchPaginated(query, key = '', limit = 100, block, cursor = 0, depth = 0) {
  // Defensive so we don't give DeFiLlama engineers a headache
  if (cursor < 0 || depth >= MAX_DEPTH) {
    return [];
  }

  const first = limit ?? 100;
  const start = cursor ?? 0;

  let q  = query.replace('<FIRST>', first);
  q = q.replace('<CURSOR>', start);
  q = q.replace('<BLOCK>', ''+block);

  const res = await request(SUBGRAPH_URL, q);
  const results = res[key] ?? [];

  // There could be more results if the length matches the query limit
  if (results .length >= first) {
    // Get the cursor for the last vault
    const lastCursor = results [first - 1].cursor ?? -1;

    // Fetch more results starting from the last cursor + 1, inclusive
    const moreResults = await fetchPaginated(query, key, limit, block, lastCursor + 1, depth + 1);
    return results .concat(moreResults );
  }

  return results ;
}

// Fetches vaults that have tokens deposited and are available to be used on the platform.
// Broken vaults (withdrawEnabled) cannot be used in a loan.
const fetchVaultQuery = gql`
  query {
    arcadeVaults(first: <FIRST>, block: { number: <BLOCK> }, where:{hasCollateral:true, withdrawEnabled:false, cursor_gte: <CURSOR>}) {
      address
      collateral {
        collectionAddress
        amount
      }
    }
  }
`;

// Helper function to fetch the first 1000 active
async function fetchVaults(block) {
  return fetchPaginated(fetchVaultQuery, 'arcadeVaults', 1000, block);
}

const fetchLoansQuery = gql`
  query {
    arcadeLoans(first: <FIRST>, block: { number: <BLOCK> }, where :{ state: "Active", cursor_gte: <CURSOR> }) {
      payableCurrency
      principal
    }
  }
`

// Helper function to fetch the first 1000 active loans
async function fetchLoans(block) {
  return fetchPaginated(fetchLoansQuery, 'arcadeLoans', 1000, block);
}

module.exports = {
  fetchLoans,
  fetchPaginated,
  fetchVaults,
}
